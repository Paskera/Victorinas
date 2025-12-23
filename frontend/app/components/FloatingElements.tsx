import React from 'react';

const FloatingElement = ({ icon, size, delay, duration, x, y, rotate }) => {
  const style = {
    position: 'absolute',
    fontSize: `${size}px`,
    animation: `float ${duration}s ease-in-out infinite alternate ${delay}s`,
    left: `${x}%`,
    top: `${y}%`,
    transform: `rotate(${rotate}deg)`,
    opacity: 0.7,
    zIndex: 0,
    pointerEvents: 'none',
  };

  return <div style={style}>{icon}</div>;
};

interface FloatingElementsProps {
  emojis?: string[];
}

const FloatingElements = ({ emojis }: FloatingElementsProps) => {
  const defaultEmojis = [
    '❓', '🎮', '😊', '🏆', '💡', '🌟', '🎉', '🚀', '🥳', '🎯', '💯', '🤩',
    '👻', '🎲', '🎭', '🎨', '🎪', '🎫', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁'
  ];

  const currentEmojis = emojis || defaultEmojis;

  // Function to generate random positions based on the index to keep them consistent but spread out
  const generateElements = (emojiList) => {
    return emojiList.map((icon, index) => {
      // Pseudo-random numbers based on index
      const size = 25 + (index * 7) % 30; // 25-55px
      const delay = (index * 0.5) % 5;
      const duration = 6 + (index * 1.3) % 8;
      const x = (index * 17) % 95; // 0-95%
      const y = (index * 23) % 95; // 0-95%
      const rotate = (index * 45) % 360 - 180;

      return { icon, size, delay, duration, x, y, rotate };
    });
  };

  const elements = generateElements(currentEmojis);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none w-full h-full">
      {elements.map((el, index) => (
        <FloatingElement key={index} {...el} />
      ))}
    </div>
  );
};

export default FloatingElements;
