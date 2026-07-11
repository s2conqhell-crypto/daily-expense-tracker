'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ValidationMessageProps {
  message?: string;
  show?: boolean;
}

export function ValidationMessage({ message, show }: ValidationMessageProps) {
  return (
    <AnimatePresence mode="wait">
      {show && message && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          role="alert"
          className="text-[12px] text-[#FF5A6E] mt-1.5 leading-tight"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
