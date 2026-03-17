'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DialogueBoxProps {
  speaker: string;
  text: string;
  onNext?: () => void;
}

export const DialogueBox = ({ speaker, text, onNext }: DialogueBoxProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(intervalId);
      }
    }, 40);

    return () => clearInterval(intervalId);
  }, [text]);

  const handleClick = () => {
    if (isTyping) {
      // Skip typing animation
      setDisplayedText(text);
      setIsTyping(false);
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card w-full p-4 cursor-pointer relative"
      onClick={handleClick}
    >
      <div className="text-[var(--accent)] font-bold mb-2 heading-font text-[10px]">
        {speaker}
      </div>
      <div className="text-sm min-h-[40px]">
        {displayedText}
      </div>
      {!isTyping && (
        <div className="absolute bottom-2 right-3 text-[10px] opacity-60 animate-bounce">
          ▼ Click to continue
        </div>
      )}
    </motion.div>
  );
};
