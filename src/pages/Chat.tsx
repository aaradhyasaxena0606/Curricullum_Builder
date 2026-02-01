import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader2, BookOpen, Bot, History, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Curriculum } from "@/pages/Generator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
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

interface AssistantResponse {
  reply: string;
  suggestions?: string[];
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load curriculum and conversations from database
  useEffect(() => {
    const loadData = async () => {
      // Load curriculum from localStorage (keep existing behavior)
      const stored = localStorage.getItem("curriculum");
      if (stored) {
        setCurriculum(JSON.parse(stored));
      }

      // Load conversations from database if user is authenticated
      if (user) {
        try {
          const { data, error } = await supabase
            .from("conversations")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(20);

          if (error) throw error;

          if (data && data.length > 0) {
            const formattedConversations: Conversation[] = data.map((conv) => ({
              id: conv.id,
              title: conv.title,
              messages: (conv.messages as any) as Message[],
              timestamp: new Date(conv.updated_at || conv.created_at || "").getTime(),
            }));

            setConversations(formattedConversations);

            // Load the most recent conversation
            const mostRecent = formattedConversations[0];
            setCurrentConversationId(mostRecent.id);
            setMessages(mostRecent.messages);
          }
        } catch (error) {
          console.error("Error loading conversations:", error);
        }
      }
    };

    loadData();
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewConversation = () => {
    const newId = crypto.randomUUID();
    setCurrentConversationId(newId);
    setMessages([]);
    setSuggestions([]);
    setShowHistory(false);
  };

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
    setMessages(conversation.messages);
    setSuggestions([]);
    setShowHistory(false);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to use the chat assistant.",
        variant: "destructive",
      });
      return;
    }

    // Start new conversation if none exists
    const conversationId = currentConversationId || crypto.randomUUID();
    if (!currentConversationId) {
      setCurrentConversationId(conversationId);
    }

    const userMessage: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: {
          message: textToSend,
          planId: curriculum?.planId || null,
          conversationHistory: messages,
          conversationId: conversationId,
          userId: user.id,
        },
      });

      if (error) throw error;

      const response: AssistantResponse = data;
      const assistantMessage: Message = {
        role: "assistant",
        content: response.reply,
      };
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Set suggestions if provided
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }

      // Update local conversations list
      const conversation: Conversation = {
        id: conversationId,
        title: finalMessages[0]?.content.slice(0, 50) || "New Conversation",
        messages: finalMessages,
        timestamp: Date.now(),
      };

      const updatedConversations = [
        conversation,
        ...conversations.filter((c) => c.id !== conversationId),
      ].slice(0, 20);

      setConversations(updatedConversations);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Message Failed",
        description: error instanceof Error ? error.message : "Could not send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startNewConversation}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 pb-4 grid lg:grid-cols-[400px_1fr] gap-4 overflow-hidden relative">
        {/* Conversation History Overlay */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="absolute left-0 top-0 h-full w-80 bg-background shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="h-full rounded-none border-0">
                  <div className="p-4 border-b">
                    <h3 className="font-display text-lg font-semibold">Conversation History</h3>
                  </div>
                  <ScrollArea className="h-[calc(100%-80px)]">
                    <div className="p-4 space-y-2">
                      {conversations.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No conversations yet
                        </p>
                      ) : (
                        conversations.map((conv) => (
                          <Button
                            key={conv.id}
                            variant={conv.id === currentConversationId ? "secondary" : "ghost"}
                            className="w-full justify-start text-left h-auto py-3"
                            onClick={() => loadConversation(conv)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{conv.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(conv.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          </Button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left Panel - Curriculum Summary */}
        <Card className="p-6 shadow-card overflow-y-auto hidden lg:block">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Your Curriculum</h2>
          </div>

          {curriculum ? (
            <div className="space-y-4">
              <div className="text-sm">
                <span className="font-medium">Duration:</span>{" "}
                {curriculum.duration_weeks} weeks
              </div>
              
              <div className="space-y-2">
                {curriculum.modules.slice(0, 5).map((module) => (
                  <div
                    key={module.week}
                    className="p-3 bg-muted/50 rounded-lg text-sm"
                  >
                    <div className="font-medium text-primary">
                      Week {module.week}: {module.subject}
                    </div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {module.title}
                    </div>
                  </div>
                ))}
                {curriculum.modules.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    + {curriculum.modules.length - 5} more weeks
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate("/generator")}
              >
                View Full Curriculum
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No curriculum generated yet.
              </p>
              <Button
                variant="default"
                onClick={() => navigate("/generator")}
              >
                Generate Curriculum
              </Button>
            </div>
          )}
        </Card>

        {/* Right Panel - Chat */}
        <Card className="p-6 shadow-card flex flex-col h-[calc(100vh-180px)]">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Ethical AI Assistant</h2>
          </div>

          {/* Messages */}
          <div className="relative flex-1 overflow-hidden">
            <div className="absolute inset-0 overflow-y-auto pb-8 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Hi! I'm your ethical AI learning assistant. Ask me questions about your studies,
                    and I'll help guide your learning journey.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Remember: I'm here to help you understand, not to provide answers to exams or assignments.
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
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

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-4 rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
            <GradualBlur direction="bottom" intensity="medium" />
          </div>

          {/* Contextual Suggestions */}
          {suggestions.length > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex flex-wrap gap-2"
            >
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </motion.div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask me about your studies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-gradient-primary"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chat;