import { useNavigate } from 'react-router-dom';

export const metadata = {
  title: 'Car Product Management',
  description: 'Manage your car products with ease',
}

export function Layout({
  children
}) {
  const navigate = useNavigate();
  return (
    
        <div className="h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
          <header className="bg-white shadow-md">
            <nav className="container justify-between flex mx-auto px-6 py-3">
              <h1 className="text-3xl  font-bold text-indigo-600">CarCatalog</h1>
              <button onClick={(e)=>{localStorage.clear();navigate('/');}}>logout</button>
            </nav>
          </header>
          <main className="container mx-auto px-6 py-8"> 
            {children}
          </main>
          <footer className="bg-white shadow-md w-screen absolute bottom-0 mt-12">
            <div className="container mx-auto px-6 py-3 text-center text-gray-600">
              © 2023 CarCatalog. All rights reserved.
            </div>
          </footer>
        </div>
      
  );
}