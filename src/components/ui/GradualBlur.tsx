import { cn } from "@/lib/utils";

interface GradualBlurProps {
  className?: string;
  direction?: "bottom" | "top";
  intensity?: "soft" | "medium" | "strong";
}

const GradualBlur = ({ 
  className, 
  direction = "bottom",
  intensity = "medium" 
}: GradualBlurProps) => {
  const intensityMap = {
    soft: "h-16",
    medium: "h-24",
    strong: "h-32",
  };

  const gradientDirection = direction === "bottom" 
    ? "bg-gradient-to-t" 
    : "bg-gradient-to-b";

  const position = direction === "bottom" 
    ? "bottom-0" 
    : "top-0";

  return (
    <div
      className={cn(
        "pointer-events-none absolute left-0 right-0 z-10",
        position,
        intensityMap[intensity],
        gradientDirection,
        "from-background via-background/80 to-transparent",
        className
      )}
      aria-hidden="true"
    />
  );
};

export default GradualBlur;
