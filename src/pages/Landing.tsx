import { motion } from "framer-motion";
import { 
  BookOpen, 
  MessageSquare, 
  GraduationCap, 
  Shield, 
  Brain, 
  Target, 
  ArrowRight, 
  Sparkles,
  Users,
  Clock,
  CheckCircle,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import CardSwap, { Card as SwapCard } from "@/components/ui/CardSwap";

const Landing = () => {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg">EthicalAI</span>
            </Link>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button onClick={() => navigate("/register")} className="bg-gradient-primary hover:opacity-90 transition-opacity">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary/10 rounded-full border border-primary/20"
            >
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Ethical AI Learning Platform</span>
            </motion.div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Build Better Study Habits with{" "}
              <span className="text-gradient">AI Guidance</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Create personalized curricula, chat with an ethical AI assistant, and learn responsibly. 
              No shortcuts—just genuine understanding.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="text-base px-8 h-12 bg-gradient-primary hover:opacity-90 transition-all shadow-soft hover:shadow-lg"
                onClick={() => navigate("/register")}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Learning Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12"
                onClick={() => navigate("/login")}
              >
                View Demo
              </Button>
            </div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>50,000+ Curricula Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>98% Satisfaction Rate</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Rotating Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 max-w-md mx-auto"
          >
            <CardSwap
              interval={5000}
              cards={[
                <SwapCard className="text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">Ethics Foundations</h3>
                  <p className="text-muted-foreground text-sm">
                    Learn the core principles of responsible AI usage with guided lessons and real-world scenarios.
                  </p>
                </SwapCard>,
                <SwapCard className="text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">Grade-Aligned Curriculum</h3>
                  <p className="text-muted-foreground text-sm">
                    Personalized study plans that match your learning level and adapt to your progress.
                  </p>
                </SwapCard>,
                <SwapCard className="text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">Assessments & Case Studies</h3>
                  <p className="text-muted-foreground text-sm">
                    Interactive quizzes and real-world case studies to reinforce your understanding.
                  </p>
                </SwapCard>,
              ]}
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to enhance your learning experience without compromising academic integrity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: GraduationCap,
                title: "Personalized Curricula",
                description: "Generate custom study plans tailored to your subjects, goals, and available time.",
                color: "primary",
              },
              {
                icon: Brain,
                title: "AI Study Assistant",
                description: "Get explanations, clarifications, and guidance from an ethical AI that helps you understand concepts.",
                color: "primary",
              },
              {
                icon: Target,
                title: "Progress Tracking",
                description: "Monitor your learning journey with detailed progress tracking and insights.",
                color: "primary",
              },
              {
                icon: Shield,
                title: "Ethical Guidelines",
                description: "Built with principles that encourage understanding over shortcuts. No exam answers, only learning support.",
                color: "primary",
              },
              {
                icon: Clock,
                title: "Flexible Scheduling",
                description: "Plan your study sessions around your availability with smart time management.",
                color: "primary",
              },
              {
                icon: MessageSquare,
                title: "Interactive Chat",
                description: "Have natural conversations about your studies and get contextual help when you need it.",
                color: "primary",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover-lift bg-card border-border">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Define Your Goals", description: "Enter your subjects, time available, and learning objectives." },
              { step: "02", title: "Generate Curriculum", description: "Our AI creates a personalized study plan optimized for your needs." },
              { step: "03", title: "Start Learning", description: "Follow your plan, chat with the AI assistant, and track your progress." },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="text-5xl font-display font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-12 md:p-16 bg-gradient-primary text-white text-center rounded-3xl shadow-glow border-0">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to transform your learning?
              </h2>
              <p className="text-lg mb-8 text-white/90 max-w-xl mx-auto">
                Join thousands of students who are building better study habits with ethical AI assistance.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-8 h-12 bg-white text-primary hover:bg-white/90"
                onClick={() => navigate("/register")}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold">EthicalAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Ethical AI Curriculum Builder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
