import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Lightbulb,
  Target,
  Loader2,
  Bot,
  User,
} from "lucide-react";

interface CoachingAdvice {
  message: string;
  suggestions: string[];
  focusAreas: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function DriverCoachingChat() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch initial coaching advice
  const { data: advice, isLoading: isLoadingAdvice } = useQuery<CoachingAdvice>({
    queryKey: ["coaching-advice"],
    queryFn: async () => {
      const response = await fetch("/api/driver/coaching/advice", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch coaching advice");
      }
      return response.json();
    },
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/driver/coaching/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Add assistant's response to chat history
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
  });

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat history
    setChatHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: message.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);

    // Send message to API
    chatMutation.mutate(message.trim());

    // Clear input
    setMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Coaching Advice Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Coaching Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAdvice ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Message */}
              <div className="text-lg">{advice?.message}</div>

              {/* Suggestions */}
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Action Items
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {advice?.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-muted-foreground">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Focus Areas */}
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Development Focus
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {advice?.focusAreas.map((area, index) => (
                    <li key={index} className="text-muted-foreground">
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with Your Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Chat History */}
          <ScrollArea
            ref={scrollAreaRef}
            className="h-[400px] pr-4 mb-4"
          >
            <div className="space-y-4">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <Bot className="h-8 w-8 p-1 rounded-full bg-primary/10 text-primary flex-shrink-0" />
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <User className="h-8 w-8 p-1 rounded-full bg-primary text-primary-foreground flex-shrink-0" />
                  )}
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-3">
                  <Bot className="h-8 w-8 p-1 rounded-full bg-primary/10 text-primary flex-shrink-0" />
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask your coach anything..."
              disabled={chatMutation.isPending}
            />
            <Button
              type="submit"
              disabled={chatMutation.isPending || !message.trim()}
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
