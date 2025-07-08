import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ children, className }) => {
  return (
    <div
      className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-lime-500 ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassPanel; 