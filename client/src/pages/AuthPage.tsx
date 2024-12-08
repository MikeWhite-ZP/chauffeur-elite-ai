import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "../hooks/use-user";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = isLogin
        ? await login({ username, password })
        : await register({ username, password });

      if (!result.ok) {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return;
      }

      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">
              {isLogin ? "Sign In" : "Create Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>
            
            <Button
              variant="link"
              className="mt-4"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
