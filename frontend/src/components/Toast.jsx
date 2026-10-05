import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? (
        <CheckCircle2 size={18} />
      ) : (
        <AlertCircle size={18} />
      )}
      <span>{message}</span>
      <button 
        onClick={onClose} 
        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '8px', display: 'flex' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
