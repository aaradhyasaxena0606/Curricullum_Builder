import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import GradualBlur from "@/components/ui/GradualBlur";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

const ChatHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadConversations();
  }, [user, navigate]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const formattedConversations: Conversation[] = (data || []).map((conv) => ({
        id: conv.id,
        title: conv.title,
        messages: (conv.messages as any) as Message[],
        timestamp: new Date(conv.updated_at || conv.created_at || "").getTime(),
      }));

      setConversations(formattedConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Error",
        description: "Could not load conversation history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Chat History</h1>
          <p className="text-muted-foreground">View your previous conversations</p>
        </div>

        {selectedConversation ? (
          <Card className="p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold">
                {selectedConversation.title}
              </h2>
              <Button variant="outline" onClick={() => setSelectedConversation(null)}>
                Back to List
              </Button>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Last updated: {new Date(selectedConversation.timestamp).toLocaleDateString()} at{" "}
              {new Date(selectedConversation.timestamp).toLocaleTimeString()}
            </div>
            <div className="relative h-[600px]">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4 pb-8">
                  {(selectedConversation.messages as Message[]).map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
              <GradualBlur direction="bottom" intensity="medium" className="rounded-b-lg" />
            </div>
          </Card>
        ) : (
          <div className="relative">
            <div className="grid gap-4 max-h-[calc(100vh-300px)] overflow-y-auto pb-8">
              {conversations.length === 0 ? (
                <Card className="p-12 text-center shadow-card">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start chatting with the AI assistant to create your first conversation.
                  </p>
                  <Button onClick={() => navigate("/chat")} className="bg-gradient-primary">
                    Start a Conversation
                  </Button>
                </Card>
              ) : (
                conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      className="p-6 shadow-card hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => viewConversation(conversation)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-semibold mb-2">
                            {conversation.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {(conversation.messages as Message[]).length} messages
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{new Date(conversation.timestamp).toLocaleDateString()}</div>
                          <div>{new Date(conversation.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
            {conversations.length > 3 && <GradualBlur direction="bottom" intensity="medium" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
