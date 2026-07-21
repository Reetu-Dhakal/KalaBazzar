import { motion } from 'framer-motion';
import { HiOutlineInbox } from 'react-icons/hi';

const EmptyState = ({ icon: Icon = HiOutlineInbox, title, message, action, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-text mb-2">{title}</h3>
      <p className="text-text-muted text-sm max-w-sm mb-6">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-primary-light transition-all shadow-sm hover:shadow-md"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
