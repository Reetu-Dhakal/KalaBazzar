import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  right: {
    hidden: { x: '100%' },
    visible: { x: 0 },
  },
  left: {
    hidden: { x: '-100%' },
    visible: { x: 0 },
  },
};

const Drawer = ({ isOpen, onClose, title, children, position = 'right' }) => {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            key="drawer-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="drawer-panel"
            variants={drawerVariants[position]}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'drawer-title' : undefined}
            className={`absolute top-0 ${position === 'right' ? 'right-0' : 'left-0'} h-full w-full max-w-md bg-white shadow-2xl flex flex-col`}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
              {title && (
                <h2 id="drawer-title" className="font-heading text-xl font-semibold text-text">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-text-muted hover:text-text hover:bg-background rounded-xl transition-colors ml-auto"
                aria-label="Close drawer"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
