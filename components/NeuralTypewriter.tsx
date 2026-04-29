
import React, { useState, useEffect, useRef } from 'react';

interface NeuralTypewriterProps {
    text: string;
    speed?: number;
}

const NeuralTypewriter: React.FC<NeuralTypewriterProps> = ({ text, speed = 25 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  
  useEffect(() => {
    if (!text) return;
    setDisplayedText('');
    setIsDone(false);
    setShouldScroll(false);
    
    let i = 0;
    let current = "";
    
    const nextChar = () => {
      if (i < text.length) {
        current += text.charAt(i);
        setDisplayedText(current);
        i++;
        setTimeout(nextChar, speed);
      } else {
        setIsDone(true);
        // Check for overflow after typing is complete
        setTimeout(() => {
          if (textRef.current && containerRef.current) {
            const isOverflowing = textRef.current.scrollHeight > containerRef.current.clientHeight;
            if (isOverflowing) {
              setShouldScroll(true);
            }
          }
        }, 100);
      }
    };
    
    nextChar();
  }, [text, speed]);

  return (
    <div ref={containerRef} className="w-full flex items-center h-10 md:h-12 overflow-hidden py-0.5 relative">
      <div className={`w-full ${shouldScroll ? 'animate-marquee-vertical' : ''}`}>
          <p 
            ref={textRef} 
            className="font-mono text-[8px] md:text-[9.5px] font-black text-cyan-400 uppercase tracking-widest leading-tight"
          >
            {displayedText}
            {!isDone && <span className="animate-pulse bg-cyan-400 w-1.5 h-3 inline-block ml-0.5 align-middle shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>}
          </p>
      </div>
      <style>{`
        @keyframes marquee-vertical {
          0%, 20% { transform: translateY(0); }
          80%, 100% { transform: translateY(calc(-100% + 2.5rem)); }
        }
        .animate-marquee-vertical {
          animation: marquee-vertical 8s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default NeuralTypewriter;
