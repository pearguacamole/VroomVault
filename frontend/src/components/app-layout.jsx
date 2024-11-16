import { useNavigate } from 'react-router-dom';

export const metadata = {
  title: 'Car Product Management',
  description: 'Manage your car products with ease',
}

export function Layout({ children }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      {/* Header */}
      <header className="bg-white shadow-md">
        <nav className="container justify-between flex mx-auto px-6 py-3">
          <h1 onClick={() => navigate('/products')} className="text-4xl font-bold text-indigo-700 cursor-pointer">
            VroomVault
          </h1>
          <button onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
        </nav>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-8 flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-3 text-center text-gray-600">
          VroomVault by 🍐
        </div>
      </footer>
    </div>
  );
}
