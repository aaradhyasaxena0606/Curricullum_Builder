import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  Shield,
  GraduationCap,
  Brain,
  History,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import CountUp from "@/components/ui/CountUp";
import CardSwap, { Card as SwapCard } from "@/components/ui/CardSwap";
import { supabase } from "@/integrations/supabase/client";
import { Curriculum } from "./Generator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    curriculums: 0,
    chats: 0,
    hoursEstimate: 0,
    progress: 0,
  });
  const [recentCurriculum, setRecentCurriculum] = useState<any>(null);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch real stats from database
    const fetchData = async () => {
      try {
        const [curriculumsRes, chatsRes, recentChatsRes] = await Promise.all([
          supabase.from("curriculums").select("*", { count: "exact" }).eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("conversations").select("id", { count: "exact" }).eq("user_id", user.id),
          supabase.from("conversations").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(3),
        ]);

        const curriculums = curriculumsRes.data || [];
        const latestCurriculum = curriculums[0];

        let overallProgress = 0;
        if (latestCurriculum && Array.isArray(latestCurriculum.modules)) {
          const modules = latestCurriculum.modules as any[];
          const completedCount = modules.filter(m => m.completed).length;
          overallProgress = modules.length > 0
            ? Math.round((completedCount / modules.length) * 100)
            : 0;
          setRecentCurriculum(latestCurriculum);
        }

        setRecentChats(recentChatsRes.data || []);

        setStats({
          curriculums: curriculumsRes.count || 0,
          chats: chatsRes.count || 0,
          hoursEstimate: (curriculumsRes.count || 0) * 2,
          progress: overallProgress,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const quickActions = [
    {
      title: "Generate Curriculum",
      description: "Create a personalized study plan",
      icon: Sparkles,
      href: "/generator",
      gradient: true,
    },
    {
      title: "Open Chat",
      description: "Talk to your AI assistant",
      icon: MessageSquare,
      href: "/chat",
      gradient: false,
    },
    {
      title: "View History",
      description: "Review past curricula",
      icon: BookOpen,
      href: "/history/curriculum",
      gradient: false,
    },
  ];

  const statCards = [
    { label: "Study Plans", value: stats.curriculums, icon: BookOpen },
    { label: "Chat Sessions", value: stats.chats, icon: MessageSquare },
    { label: "Hours Saved", value: stats.hoursEstimate, icon: Clock },
    { label: "Goals Tracked", value: stats.curriculums, icon: Target },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="font-display text-3xl font-bold">
            Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your learning journey? Here's what you can do today.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-display text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className={`p-6 cursor-pointer hover-lift transition-all ${action.gradient
                  ? "bg-gradient-primary text-white border-0"
                  : "bg-card hover:border-primary/50"
                  }`}
                onClick={() => navigate(action.href)}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${action.gradient ? "bg-white/20" : "bg-primary/10"
                  }`}>
                  <action.icon className={`h-6 w-6 ${action.gradient ? "text-white" : "text-primary"}`} />
                </div>
                <h3 className="font-display font-semibold mb-1">{action.title}</h3>
                <p className={`text-sm ${action.gradient ? "text-white/80" : "text-muted-foreground"}`}>
                  {action.description}
                </p>
                <ArrowRight className={`h-4 w-4 mt-4 ${action.gradient ? "text-white/60" : "text-muted-foreground"}`} />
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-lg font-semibold mb-4">Your Progress</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <Card key={index} className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      <CountUp end={stat.value} duration={1500} delay={index * 100} />
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Highlights Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="font-display text-lg font-semibold mb-4">What You Can Build</h2>
          <CardSwap
            interval={4500}
            cards={[
              <SwapCard className="text-center py-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">Ethics-First Learning</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Create curricula that prioritize understanding over memorization, with AI guidance that respects academic integrity.
                </p>
              </SwapCard>,
              <SwapCard className="text-center py-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">Personalized Paths</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Get study plans tailored to your subjects, time availability, and learning goals.
                </p>
              </SwapCard>,
              <SwapCard className="text-center py-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">AI Study Companion</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Chat with an AI that explains concepts, answers questions, and guides your learning journey.
                </p>
              </SwapCard>,
            ]}
          />
        </motion.div>

        {/* Progress and Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Current Study Progress
            </h2>
            <Card className="p-6">
              {recentCurriculum ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{recentCurriculum.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((stats.progress / 100) * (Array.isArray(recentCurriculum.modules) ? recentCurriculum.modules.length : 0))} of {Array.isArray(recentCurriculum.modules) ? recentCurriculum.modules.length : 0} modules completed
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-primary">{stats.progress}%</span>
                    </div>
                    <Progress value={stats.progress} className="h-3" />
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full group"
                      onClick={() => navigate("/history/curriculum")}
                    >
                      Continue Learning
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground text-sm">No active curriculum found.</p>
                  <Button
                    variant="link"
                    onClick={() => navigate("/generator")}
                    className="mt-2 text-primary"
                  >
                    Generate one now
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Recent Activity Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-4"
          >
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Recent Conversations
            </h2>
            <Card className="p-6">
              {recentChats.length > 0 ? (
                <div className="space-y-4">
                  {recentChats.map((chat) => (
                    <div
                      key={chat.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border group"
                      onClick={() => navigate("/chat")}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-medium truncate">{chat.title || "New Chat"}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(chat.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-primary"
                    onClick={() => navigate("/history/chat")}
                  >
                    View All Activity
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground text-sm">No recent conversations.</p>
                  <Button
                    variant="link"
                    onClick={() => navigate("/chat")}
                    className="mt-2 text-primary"
                  >
                    Start a chat
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
