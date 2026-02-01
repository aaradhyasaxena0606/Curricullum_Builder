import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CurriculumView from "@/components/CurriculumView";
import { useAuth } from "@/contexts/AuthContext";

export interface Resource {
  title: string;
  url: string;
  type: "free" | "paid";
}

export interface CurriculumModule {
  week: number;
  subject: string;
  title: string;
  learning_outcomes: string[];
  activities: string[];
  resources: Resource[];
}

export interface Curriculum {
  planId: string;
  duration_weeks: number;
  learningPath?: string;
  modules: CurriculumModule[];
}

const Generator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);

  const [formData, setFormData] = useState({
    subjects: "",
    durationWeeks: "",
    hoursPerDay: "",
    goal: "",
    hardestSubject: "",
    learningPath: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subjects || !formData.durationWeeks || !formData.hoursPerDay || !formData.learningPath) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-curriculum", {
        body: {
          subjects: formData.subjects.split(",").map((s) => s.trim()),
          durationWeeks: parseInt(formData.durationWeeks),
          hoursPerDay: parseInt(formData.hoursPerDay),
          goal: formData.goal,
          hardestSubject: formData.hardestSubject,
          learningPath: formData.learningPath,
          userId: user?.id || null,
        },
      });

      if (error) throw error;

      setCurriculum(data);
      localStorage.setItem("curriculum", JSON.stringify(data));
      
      toast({
        title: "Curriculum Generated!",
        description: "Your personalized study plan is ready.",
      });
    } catch (error) {
      console.error("Error generating curriculum:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate curriculum. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {!curriculum ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8 shadow-soft">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="font-display text-3xl font-bold">Generate Your Curriculum</h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="subjects">
                    Subjects <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="subjects"
                    placeholder="Math, Physics, Chemistry (comma separated)"
                    value={formData.subjects}
                    onChange={(e) =>
                      setFormData({ ...formData, subjects: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">
                      Duration (weeks) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="52"
                      placeholder="12"
                      value={formData.durationWeeks}
                      onChange={(e) =>
                        setFormData({ ...formData, durationWeeks: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="hours">
                      Hours/Day <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="hours"
                      type="number"
                      min="1"
                      max="24"
                      placeholder="3"
                      value={formData.hoursPerDay}
                      onChange={(e) =>
                        setFormData({ ...formData, hoursPerDay: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="goal">Academic Goal</Label>
                  <Textarea
                    id="goal"
                    placeholder="E.g., Prepare for university entrance exams"
                    value={formData.goal}
                    onChange={(e) =>
                      setFormData({ ...formData, goal: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="hardest">Hardest Subject (Optional)</Label>
                  <Input
                    id="hardest"
                    placeholder="E.g., Calculus"
                    value={formData.hardestSubject}
                    onChange={(e) =>
                      setFormData({ ...formData, hardestSubject: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="learningPath">
                    Learning Path <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.learningPath}
                    onValueChange={(value) =>
                      setFormData({ ...formData, learningPath: value })
                    }
                    required
                  >
                    <SelectTrigger id="learningPath">
                      <SelectValue placeholder="Select your preferred learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Article">Article</SelectItem>
                      <SelectItem value="Question & Practice">Question & Practice</SelectItem>
                      <SelectItem value="Mixed">Mixed (Best Resources)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Curriculum
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        ) : (
          <CurriculumView curriculum={curriculum} />
        )}
      </div>
    </div>
  );
};

export default Generator;