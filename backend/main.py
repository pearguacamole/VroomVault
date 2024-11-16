from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from sqlalchemy.orm import Session, relationship
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from jose import jwt, JWTError
import uuid
import os

# Configuration
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()
app.mount("/images", StaticFiles(directory="./images"), name="images")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup
DATABASE_URL = "sqlite:///./cars.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    cars = relationship("Car", back_populates="owner")


class Car(Base):
    __tablename__ = "cars"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    tags = Column(String, nullable=True)
    image_urls = Column(Text,nullable=True)  # URLs stored as comma-separated strings
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="cars")

Base.metadata.create_all(bind=engine)

# Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class CarCreate(BaseModel):
    title: str 
    description: str 
    tags: Optional[List[str]] 
    images: Optional[List[UploadFile]] 


class CarUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = []
    images: Optional[List[UploadFile]] = []


class CarResponse(BaseModel):
    id: int
    title: str
    description: str
    tags: List[str]
    image_urls: List[str]
    owner_id: int

    class Config:
        orm_mode = True


# Dependency Functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"sub": data.get("email")})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = get_user_by_email(db, email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def serialize_car(car: Car, request: Request):
    return CarResponse(
        id=car.id,
        title=car.title,
        description=car.description,
        tags=car.tags.split(",") if car.tags else [],
        image_urls=[ f"{request.base_url}images/{image_url.split('/')[-1]}" for image_url in car.image_urls.split(',') ] if car.image_urls else [],
        owner_id=car.owner_id
    )



# API Endpoints
@app.post("/signup")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = pwd_context.hash(user.password)
    new_user = User(name = user.name, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}


@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token({"email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/cars", response_model=CarResponse)
def create_car(
    request: Request,
    title: str = Form(...),
    description: str = Form(...),
    tags: str = Form(''),  # Tags passed as a comma-separated string
    images: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Parse tags from comma-separated string
    tags_list = [tag.strip() for tag in tags.split(",")]
    
    # Save images and collect file paths
    image_urls = []
    if images:
        for image in images[:10]:  # Limit to 10 images
            filename = f"{uuid.uuid4()}.jpg"
            filepath = f"./images/{filename}"
            with open(filepath, "wb") as f:
                f.write(image.file.read())
            image_urls.append(filepath)

    # Create Car object
    car_obj = Car(
        title=title,
        description=description,
        tags=",".join(tags_list),
        image_urls=",".join(image_urls),
        owner_id=user.id,
    )
    db.add(car_obj)
    db.commit()
    db.refresh(car_obj)
    return serialize_car(car_obj,request)


@app.get("/cars", response_model=List[CarResponse])
def list_user_cars(request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cars = db.query(Car).filter(Car.owner_id == user.id).all()
    return [serialize_car(car,request) for car in cars]


@app.get("/cars/search", response_model=List[CarResponse])
def search_cars(request: Request, keyword: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    keyword = f"%{keyword}%"
    cars = db.query(Car).filter(
        Car.owner_id == user.id,
        (Car.title.like(keyword) | Car.description.like(keyword) | Car.tags.like(keyword))
    ).all()
    return [serialize_car(car,request) for car in cars]


@app.get("/cars/{car_id}", response_model=CarResponse)
def get_car(request: Request, car_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    car = db.query(Car).filter(Car.id == car_id, Car.owner_id == user.id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return serialize_car(car,request)


from fastapi import Form, File, UploadFile

import os

@app.put("/cars/{car_id}", response_model=CarResponse)
def update_car(
    request: Request,
    car_id: int,
    title: str = Form(None),
    description: str = Form(None),
    tags: str = Form(None),  # Comma-separated tags
    images: List[UploadFile] = File([]),  # New images to upload
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Query the car
    car_obj = db.query(Car).filter(Car.id == car_id, Car.owner_id == user.id).first()
    if not car_obj:
        raise HTTPException(status_code=404, detail="Car not found")

    # Update title and description if provided
    if title:
        car_obj.title = title
    if description:
        car_obj.description = description

    # Update tags if provided
    if tags:
        tags_list = [tag.strip() for tag in tags.split(",")]
        car_obj.tags = ",".join(tags_list)

    # Handle image updates (overwrite existing images with new ones)
    if images:
        # Delete old images
        if car_obj.image_urls:
            old_image_paths = car_obj.image_urls.split(",")
            for old_path in old_image_paths:
                if os.path.exists(old_path):
                    os.remove(old_path)

        # Save new images
        image_urls = []
        for image in images[:10]:  # Limit to 10 images
            filename = f"{uuid.uuid4()}.jpg"
            filepath = f"./images/{filename}"
            with open(filepath, "wb") as f:
                f.write(image.file.read())
            image_urls.append(filepath)
        car_obj.image_urls = ",".join(image_urls)

    # Commit changes
    db.commit()
    db.refresh(car_obj)
    return serialize_car(car_obj,request)




@app.delete("/cars/{car_id}")
def delete_car(car_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    car = db.query(Car).filter(Car.id == car_id, Car.owner_id == user.id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
        # Delete associated images from the file system
    if car.image_urls:
        image_paths = car.image_urls.split(",")  # Assuming images are stored as a comma-separated string
        for image_path in image_paths:
            if os.path.exists(image_path):  # Check if the file exists
                os.remove(image_path)  # Delete the file
    db.delete(car)
    db.commit()
    return {"message": "Car deleted successfully"}
