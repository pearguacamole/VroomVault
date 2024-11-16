import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BlockPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (event, type) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
      if (type === "signup") {
        // Signup logic
        const response = await fetch("http://3.80.103.167/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.detail || "Signup failed");
        }

        alert("Signup successful! You can now log in.");
      } else if (type === "login") {
        // Login logic
        const response = await fetch("http://3.80.103.167/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: data.email,
            password: data.password,
          }),
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.detail || "Login failed");
        }

        const { access_token } = await response.json();
        localStorage.setItem("token", access_token); // Store token for authenticated requests
        // Redirect to /products
        navigate("/products");
        alert("Login successful!");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
    <header className="bg-white shadow-md">
      <nav className="container justify-between flex mx-auto px-6 py-3">
        <h1 className="text-4xl  font-bold text-indigo-700">VroomVault</h1>
      </nav>
    </header>
    <main className="container mx-auto px-6 py-8"> 
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form
              onSubmit={(e) => handleSubmit(e, "login")}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form
              onSubmit={(e) => handleSubmit(e, "signup")}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </main>
          <footer className="bg-white shadow-md w-screen absolute bottom-0 mt-12">
            <div className="container mx-auto px-6 py-3 text-center text-gray-600">
            VroomVault by 🍐
            </div>
          </footer>
        </div>
  );
}

export default BlockPage;
