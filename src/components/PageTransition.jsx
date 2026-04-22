import { motion } from "framer-motion";
import { useMotion } from "@/context/MotionContext";

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

function PageTransition({ children }) {
  const { reduceMotion } = useMotion();

  return (
    <motion.div
      variants={variants}
      initial={reduceMotion ? false : "initial"}
      animate="animate"
      exit={reduceMotion ? false : "exit"}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
