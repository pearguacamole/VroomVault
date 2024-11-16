### **VroomVault: A Car Management Application**  

--- 

This project provides a streamlined solution for car management with an intuitive interface and a robust backend.

___

**Website URL:** [vroomvault.vercel.app](https://vroomvault.vercel.app)  
**Backend URL:** [kushagra.info.gf](https://kushagra.info.gf)  

#### **Demo User Credentials**  
**Email:** vroom@gmail.com  
**Password:** vroomvault  

---

### **Tech Stack**  
- **Frontend:** React with Vite  
- **Backend:** Python with FastAPI  
- **Hosting:**  
  - **Frontend:** Vercel  
  - **Backend:** AWS EC2  

---

### **Features**  
1. **User Authentication:** Users can log in or sign up. Users are allowed to interact with their cars only.
2. **Add Cars:** Users can add a car with up to 10 images, a title, a description, and tags.  
3. **View Cars:** Users can view a list of all their cars.  
4. **Global Search:** A powerful global search that lists all cars matching a keyword in their title, description, or tags.  
5. **Car Details:** Users can view detailed information about a specific car.  
6. **Update Cars:** Users can update a car’s title, description, tags, or images.  
7. **Delete Cars:** Users can remove cars from the database.  

---

### **API Documentation**  
The API documentation is hosted and can be accessed at the following routes:  
- **ReDoc:** [Redoc Documentation](https://kushagra.info.gf/docs/redoc)  
- **OpenAPI Specification:** [OpenAPI Documentation](https://kushagra.info.gf/docs/docs)  

---

### **API Endpoints**  

#### **POST**  
1. **Create User:** Registers a new user.  
2. **Login:** Authenticates the user and returns an authorization token.  
3. 🔒 **Create Car:** Adds a new car entry to the database.  

#### **GET**  
4. 🔒 **List User Cars:** Retrieves a list of all cars belonging to the logged-in user.  
5. 🔒 **Search Cars:** Searches the user’s cars by title, description, or tags.  
6. 🔒 **Get Car:** Retrieves details of a specific car.  

#### **PUT**  
7. 🔒 **Update Car:** Modifies details of a specific car (title, description, tags, or images).  

#### **DELETE**  
8. 🔒 **Delete Car:** Removes a car from the database.  

