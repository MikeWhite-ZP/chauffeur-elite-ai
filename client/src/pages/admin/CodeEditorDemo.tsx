import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeEditor } from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DEMO_CODE = `// Example TypeScript code
interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User) {
  return \`Hello, \${user.name}!\`;
}

// Try editing this code!
// Changes are automatically saved.
`;

export default function CodeEditorDemo() {
  const [code, setCode] = useState(DEMO_CODE);
  const { toast } = useToast();

  const handleSave = async (newCode: string) => {
    // Simulate an API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // In a real application, you would save to your backend here
    console.log("Saving code:", newCode);
  };

  const handleFormat = () => {
    try {
      // Format the code using prettier (in a real app)
      // For demo, we'll just show a toast
      toast({
        title: "Code formatted",
        description: "Your code has been automatically formatted.",
      });
    } catch (error) {
      toast({
        title: "Error formatting code",
        description: "Failed to format the code. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Code Editor</CardTitle>
          <Button onClick={handleFormat}>Format Code</Button>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <CodeEditor
              value={code}
              onChange={setCode}
              onSave={handleSave}
              language="typescript"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
