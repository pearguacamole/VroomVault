import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import BlockPage from "./components/app-auth-page";
import ProductPage from "./components/app-products-id-page";
import ProductItem from "./components/app-products-page";
import ProductCreate from "./components/app-products-new-page";
import DocsPage from "./components/app-docs-page";
import { Layout } from "./components/app-layout";
import { useEffect, useState } from "react";

// Protected Route Component
function PrivateRoute({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check token existence
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);

    if (!savedToken) {
      navigate("/"); // Redirect to home if no token
    }
  }, [navigate]);

  if (!token) {
    // Show loading state or a fallback while checking the token
    return <p>Loading...</p>;
  }

  // Render the children if token exists
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BlockPage/>} />
        <Route path="/products/new" element={<PrivateRoute><Layout><ProductCreate /></Layout></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Layout><ProductItem /></Layout></PrivateRoute>} />
        <Route path="/products/:id" element={<PrivateRoute><Layout><ProductPage /></Layout></PrivateRoute>} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
