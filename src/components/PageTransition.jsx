import { motion } from "framer-motion";
import { useMotion } from "@/context/MotionContext";

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

const staticVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

function PageTransition({ children }) {
  const { reduceMotion } = useMotion();
  return (
    <motion.div
      variants={reduceMotion ? staticVariants : variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: reduceMotion ? 0.1 : 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
