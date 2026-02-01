import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CurriculumView from "@/components/CurriculumView";
import { Curriculum } from "@/pages/Generator";
import GradualBlur from "@/components/ui/GradualBlur";

interface CurriculumRecord {
  id: string;
  title: string;
  subjects: string[];
  goal: string;
  duration_weeks: number;
  modules: any;
  plan_id: string;
  created_at: string;
  updated_at: string;
}

const CurriculumHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [curriculums, setCurriculums] = useState<CurriculumRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadCurriculums();
  }, [user, navigate]);

  const loadCurriculums = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("curriculums")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCurriculums(data || []);
    } catch (error) {
      console.error("Error loading curriculums:", error);
      toast({
        title: "Error",
        description: "Could not load curriculum history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewCurriculum = (record: CurriculumRecord) => {
    const curriculum: Curriculum = {
      planId: record.plan_id,
      duration_weeks: record.duration_weeks,
      modules: record.modules,
    };
    setSelectedCurriculum(curriculum);
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
        {!selectedCurriculum && (
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        )}

        {selectedCurriculum ? (
          <div>
            <Button
              variant="ghost"
              onClick={() => setSelectedCurriculum(null)}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Button>
            <CurriculumView curriculum={selectedCurriculum} />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="font-display text-4xl font-bold mb-2">Curriculum History</h1>
              <p className="text-muted-foreground">
                View your previously generated study plans
              </p>
            </div>

            <div className="relative">
              <div className="grid gap-4 max-h-[calc(100vh-300px)] overflow-y-auto pb-8">
                {curriculums.length === 0 ? (
                  <Card className="p-12 text-center shadow-card">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold mb-2">
                      No curriculums yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Generate your first personalized study plan to get started.
                    </p>
                    <Button
                      onClick={() => navigate("/generator")}
                      className="bg-gradient-primary"
                    >
                      Generate Curriculum
                    </Button>
                  </Card>
                ) : (
                  curriculums.map((curriculum) => (
                    <motion.div
                      key={curriculum.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card
                        className="p-6 shadow-card hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => viewCurriculum(curriculum)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-display text-lg font-semibold mb-2">
                              {curriculum.title}
                            </h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>
                                <span className="font-medium">Subjects:</span>{" "}
                                {curriculum.subjects.join(", ")}
                              </p>
                              <p>
                                <span className="font-medium">Duration:</span>{" "}
                                {curriculum.duration_weeks} weeks
                              </p>
                              <p>
                                <span className="font-medium">Goal:</span> {curriculum.goal}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>
                              {new Date(curriculum.created_at).toLocaleDateString()}
                            </div>
                            <div>
                              {new Date(curriculum.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
              {curriculums.length > 3 && <GradualBlur direction="bottom" intensity="medium" />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CurriculumHistory;
