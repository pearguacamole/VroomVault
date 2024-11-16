import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function ProductItem() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
        setLoading(true);
        const response = await fetch('http://3.80.103.167/cars', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        console.log(data); // Debug the API response
        setProducts(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};


  // Filtered products based on search term
  const fetchSearchResults = async () => {
    try {
      const response = await fetch(`http://3.80.103.167/cars/search?keyword=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch products initially and whenever search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      fetchSearchResults();
    } else {
      fetchProducts();
    }
  }, [searchTerm]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Your Products</h2>
        <Link to="/products/new">
          <Button>Add New Product</Button>
        </Link>
      </div>
      <Input
        type="search"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <img
              src={product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '/placeholder.svg?height=100&width=200'}
              alt={product.title}
              className="w-full h-48 object-cover"
            />
            <CardHeader>
              <CardTitle>{product.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{product.description}</p>
            </CardContent>
            <CardFooter>
              <Link to={`/products/${product.id}`}>
                <Button variant="outline">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProductItem;
