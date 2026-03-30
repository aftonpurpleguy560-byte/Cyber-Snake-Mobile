import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

// Ses Efektleri (Public klasörüne bu isimlerle ses dosyaları eklemelisin)
const sounds = {
  eat: new Howl({ src: ['/sounds/eat.mp3'], volume: 0.5 }),
  gameOver: new Howl({ src: ['/sounds/gameover.mp3'], volume: 0.7 }),
  special: new Howl({ src: ['/sounds/powerup.mp3'], volume: 0.6 }),
  click: new Howl({ src: ['/sounds/click.mp3'], volume: 0.3 }),
};

const FOOD_TYPES = [
  { type: '🍎', score: 1, chance: 0.4 }, { type: '🍐', score: 2, chance: 0.1 },
  { type: '🍊', score: 2, chance: 0.1 }, { type: '🍋', score: 3, chance: 0.05 },
  { type: '🍌', score: 2, chance: 0.1 }, { type: '🍉', score: 4, chance: 0.05 },
  { type: '🍇', score: 3, chance: 0.05 }, { type: '🍓', score: 5, chance: 0.03 },
  { type: '🍒', score: 5, chance: 0.03 }, { type: '🍍', score: 6, chance: 0.02 },
  { type: '🥝', score: 4, chance: 0.04 }, { type: '🍅', score: 2, chance: 0.1 },
  { type: '🥑', score: 7, chance: 0.02 }, { type: '🍆', score: 3, chance: 0.05 },
  { type: '🥔', score: 1, chance: 0.1 }, { type: '🥕', score: 2, chance: 0.1 },
  { type: '🌽', score: 3, chance: 0.05 }, { type: '🌶️', score: 10, chance: 0.01 }, // Hızlandırır!
  { type: '⭐', score: 15, chance: 0.01 }, { type: '💎', score: 25, chance: 0.005 }
];

const CyberSnake = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5, ...FOOD_TYPES[0] });
  const [dir, setDir] = useState({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState('Klasik');
  const [isGameOver, setIsGameOver] = useState(false);

  // Yemek Oluşturma Fonksiyonu
  const getRandomFood = () => {
    const random = Math.random();
    let cumulative = 0;
    const item = FOOD_TYPES.find(f => {
      cumulative += f.chance;
      return random < cumulative;
    }) || FOOD_TYPES[0];
    
    return {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20),
      ...item
    };
  };

  const handleMove = (newDir) => {
    sounds.click.play();
    setDir(newDir);
  };

  // Oyun Döngüsü (Basitleştirilmiş)
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      const newSnake = [...snake];
      const head = { x: newSnake[0].x + dir.x, y: newSnake[0].y + dir.y };

      // Yemek yeme kontrolü
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + food.score);
        setFood(getRandomFood());
        food.score > 5 ? sounds.special.play() : sounds.eat.play();
      } else {
        newSnake.pop();
      }

      // Duvar/Kuyruk çarpma kontrolü
      if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || 
          newSnake.some(s => s.x === head.x && s.y === head.y)) {
        setIsGameOver(true);
        sounds.gameOver.play();
        return;
      }

      newSnake.unshift(head);
      setSnake(newSnake);
    }, 150);

    return () => clearInterval(interval);
  }, [snake, dir, isGameOver]);

  return (
    <div className="flex flex-col items-center bg-black min-h-screen text-neon-purple p-4">
      <h1 className="text-4xl font-bold mb-4 shadow-neon">CYBER SNAKE V4</h1>
      
      <div className="relative border-4 border-purple-500 shadow-lg mb-8">
        <canvas ref={canvasRef} width={300} height={300} className="bg-gray-900" />
        {/* Render Snake and Food logic here with Canvas API */}
      </div>

      {/* Tablet D-Pad Kontrolleri */}
      <div className="grid grid-cols-3 gap-4">
        <div />
        <button onClick={() => handleMove({ x: 0, y: -1 })} className="p-8 bg-purple-900 rounded-xl text-3xl">▲</button>
        <div />
        <button onClick={() => handleMove({ x: -1, y: 0 })} className="p-8 bg-purple-900 rounded-xl text-3xl">◀</button>
        <button onClick={() => handleMove({ x: 0, y: 1 })} className="p-8 bg-purple-900 rounded-xl text-3xl">▼</button>
        <button onClick={() => handleMove({ x: 1, y: 0 })} className="p-8 bg-purple-900 rounded-xl text-3xl">▶</button>
      </div>

      <div className="mt-4 text-2xl font-mono">SKOR: {score}</div>
    </div>
  );
};

export default CyberSnake;

