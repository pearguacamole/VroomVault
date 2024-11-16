import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function ProductPage() {
  const { id } = useParams(); // Get product ID from the route
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://kushagra.info.gf/cars/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        const data = await response.json();
        setProduct(data);
        setImages(data.image_urls || []);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
  
    try {
      const formData = new FormData();
  
      // Append product details
      formData.append('title', product.title);
      formData.append('description', product.description);
      formData.append('tags',product.tags);
  
      // Append all images (old + new), ensuring max 10
      const allImages = images.slice(0, 10); // Ensure max 10 images
      for (const image of allImages) {
        if (image instanceof File) {
          formData.append('images', image); // Append new images
        } else {
          // Fetch old image as a blob to mimic a File
          const response = await fetch(image);
          const blob = await response.blob();
          const filename = image.split('/').pop(); // Extract filename from URL
          const file = new File([blob], filename, { type: blob.type });
          formData.append('images', file); // Append as a File object
        }
      }
  
      const response = await fetch(`https://kushagra.info.gf/cars/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData, // Send FormData
      });
  
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
  
      const updatedProduct = await response.json();
      setProduct(updatedProduct);
      setImages(updatedProduct.image_urls || []);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://kushagra.info.gf/cars/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      navigate('/products'); // Navigate back to the products page
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const files = event.target.files;
  
    // Store actual file objects for uploading to the backend
    if (files && images.length + files.length <= 10) {
      setImages([...images, ...files]);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    if (currentImageIndex >= images.length - 1) {
      setCurrentImageIndex(images.length - 2);
    }
  };

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Product Details</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={product.title || ''}
              onChange={(e) => setProduct({ ...product, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={product.description || ''}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Textarea
              id="tags"
              value={product.tags || ''}
              onChange={(e) => setProduct({ ...product, tags: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="images">Images (Max 10)</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={images.length >= 10}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img src={image} alt={`Product image ${index + 1}`} className="object-cover rounded w-full h-20" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 rounded-full"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex space-x-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <img
              src={images[currentImageIndex]}
              alt={product.title}
              className="w-full h-[400px] object-cover rounded-lg shadow-md"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 rounded-full"
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 rounded-full"
                  onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <div className="flex space-x-2 overflow-x-auto py-2">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`object-cover rounded cursor-pointer w-20 h-20 ${
                  index === currentImageIndex ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
          <h3 className="text-2xl font-semibold">{product.title}</h3>
          <p className="text-gray-600">{product.description}</p>
          <div className="flex space-x-4">
            <Button vvariant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
