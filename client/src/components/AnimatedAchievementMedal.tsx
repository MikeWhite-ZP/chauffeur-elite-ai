import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";
import { cn } from "@/lib/utils";

interface AnimatedAchievementMedalProps {
  name: string;
  description: string;
  icon: string;
  points: number;
  isNew?: boolean;
  earnedAt?: string;
  className?: string;
}

export function AnimatedAchievementMedal({
  name,
  description,
  icon,
  points,
  isNew,
  earnedAt,
  className,
}: AnimatedAchievementMedalProps) {
  const [showConfetti, setShowConfetti] = useState(isNew);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}
      <motion.div
        initial={isNew ? { scale: 0, rotate: -180 } : false}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.05 }}
        className={cn(
          "relative flex flex-col items-center justify-center p-4",
          className
        )}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 rounded-full opacity-50"
          animate={{
            backgroundPosition: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 3,
            ease: "linear",
            repeat: Infinity,
          }}
        />
        <motion.div
          className="relative z-10 flex flex-col items-center bg-background rounded-full p-6 shadow-lg"
          whileHover={{ y: -5 }}
        >
          <span className="text-4xl mb-2">{icon}</span>
          <motion.div
            initial={isNew ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h3 className="font-bold">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-sm font-semibold text-yellow-600 mt-1">
              +{points} points
            </p>
            {earnedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Earned {new Date(earnedAt).toLocaleDateString()}
              </p>
            )}
          </motion.div>
        </motion.div>
        {isNew && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full"
          >
            New!
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
