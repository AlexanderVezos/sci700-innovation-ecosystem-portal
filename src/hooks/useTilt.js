import { useRef } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

export function useTilt(reduceMotion) {
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);

  const rotateX = useTransform(y, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);
  const scale = useSpring(1, springConfig);

  // Image drifts opposite to tilt; the 1.15 base scale in imgStyle ensures no edges are exposed
  const imgX = useTransform(x, [-0.5, 0.5], ["-6px", "6px"]);
  const imgY = useTransform(y, [-0.5, 0.5], ["-6px", "6px"]);

  const onMouseMove = (e) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    scale.set(1.04);
  };

  const onMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    scale.set(1);
  };

  return {
    ref,
    onMouseMove,
    onMouseLeave,
    cardStyle: reduceMotion
      ? {}
      : { rotateX, rotateY, scale, transformPerspective: 800 },
    imgStyle: reduceMotion ? {} : { x: imgX, y: imgY, scale: 1.15 },
  };
}
