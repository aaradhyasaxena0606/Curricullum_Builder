import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardSwapProps {
  cards: ReactNode[];
  interval?: number;
  className?: string;
  cardClassName?: string;
}

const CardSwap = ({
  cards,
  interval = 4000,
  className,
  cardClassName,
}: CardSwapProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (cards.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, interval);

    return () => clearInterval(timer);
  }, [cards.length, interval]);

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
          }}
          className={cardClassName}
        >
          {cards[currentIndex]}
        </motion.div>
      </AnimatePresence>

      {/* Indicator dots */}
      <div className="flex justify-center gap-2 mt-4">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentIndex
                ? "w-6 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardSwap;
