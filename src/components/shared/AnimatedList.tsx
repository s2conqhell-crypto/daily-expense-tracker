'use client';

import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function AnimatedContainer({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" {...props}>
      {children}
    </motion.div>
  );
}

export function AnimatedItem({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={itemVariants} {...props}>
      {children}
    </motion.div>
  );
}

export const staggerItem = itemVariants.show;
