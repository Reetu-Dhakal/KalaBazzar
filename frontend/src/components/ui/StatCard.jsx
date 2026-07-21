import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ label, value, trend, icon: Icon, className = '' }) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-white rounded-2xl border border-border/50 p-6 hover:shadow-xl hover:border-border transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-text-muted font-body">{label}</p>
          <p className="text-3xl md:text-4xl font-heading font-semibold text-text mt-1">{value}</p>
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-medium font-body ${trend.isUp ? 'text-success' : 'text-error'}`}>
            {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-text-muted font-body">vs last month</span>
        </div>
      )}
    </motion.div>
  );
};
