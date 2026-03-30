import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

// Ses Efektleri
const sounds = {
  eat: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3'], volume: 0.5 }), // Örnek ses linki
  gameOver: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3'], volume: 0.7 }),
  click: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], volume: 0.3 }),
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
  { type: '🌽', score: 3, chance: 0.05 }, { type: '🌶️', score: 10, chance: 0.01 },
  { type: '⭐', score: 15, chance: 0.01 }, { type: '💎', score: 25, chance: 0.005 }
];

const CyberSnake = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5, ...FOOD_TYPES[0] });
  const [dir, setDir] = useState({ x: 0, y: 0 }); // Başlangıçta durur
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const gridSize = 20;

  // Çizim Mantığı
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Arka plan grid çizgileri
    ctx.strokeStyle = '#1a1a2e';
    for(let i=0; i<canvas.width; i+=gridSize) {
      ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); ctx.stroke();
    }

    // Yılanı Çiz (Neon Efektli)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ff00';
    ctx.fillStyle = '#00ff00';
    snake.forEach((part, index) => {
      ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
      if(index === 0) { // Gözler
        ctx.fillStyle = 'black';
        ctx.fillRect(part.x * gridSize + 4, part.y * gridSize + 4, 4, 4);
        ctx.fillStyle = '#00ff00';
      }
    });

    // Yemeği Çiz
    ctx.shadowColor = '#ff00ff';
    ctx.font = '16px serif';
    ctx.fillText(food.type, food.x * gridSize + 2, food.y * gridSize + 16);
    
  }, [snake, food]);

  // Hareket Mantığı
  useEffect(() => {
    if (isGameOver || (dir.x === 0 && dir.y === 0)) return;

    const moveSnake = () => {
      setSnake(prev => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        
        // Çarpışma Kontrolü
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || prev.some(p => p.x === head.x && p.y === head.y)) {
          setIsGameOver(true);
          sounds.gameOver.play();
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + food.score);
          sounds.eat.play();
          
          // Yeni yemek bul
          let newFood;
          do {
            const random = Math.random();
            let cumulative = 0;
            const type = FOOD_TYPES.find(f => (cumulative += f.chance) > random) || FOOD_TYPES[0];
            newFood = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20), ...type };
          } while (newSnake.some(p => p.x === newFood.x && p.y === newFood.y));
          
          setFood(newFood);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [dir, food, isGameOver]);

  const handleControl = (d) => {
    if (isGameOver) {
      setSnake([{ x: 10, y: 10 }]);
      setScore(0);
      setIsGameOver(false);
      setDir({ x: 0, y: 0 });
    } else {
      sounds.click.play();
      setDir(d);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-[#0a0a0a] min-h-screen text-white font-sans p-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 uppercase">
          Cyber Snake Mobile
        </h1>
        <p className="text-gray-400 font-mono">Score: <span className="text-green-400">{score}</span></p>
      </div>

      <div className="relative rounded-lg overflow-hidden border-2 border-purple-900/50 shadow-[0_0_50px_-12px_rgba(168,85,247,0.4)]">
        <canvas ref={canvasRef} width={400} height={400} className="bg-[#050505]" />
        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-red-500 mb-2">GAME OVER</h2>
            <button onClick={() => handleControl({x:0, y:0})} className="px-6 py-2 bg-purple-600 rounded-full font-bold">RESTART</button>
          </div>
        )}
      </div>

      {/* Tablet D-PAD */}
      <div className="mt-8 grid grid-cols-3 gap-2">
        <div />
        <button onClick={() => handleControl({x:0, y:-1})} className="w-16 h-16 bg-purple-900/30 border border-purple-500/50 rounded-xl flex items-center justify-center text-2xl active:scale-95 transition-all">▲</button>
        <div />
        <button onClick={() => handleControl({x:-1, y:0})} className="w-16 h-16 bg-purple-900/30 border border-purple-500/50 rounded-xl flex items-center justify-center text-2xl active:scale-95 transition-all">◀</button>
        <button onClick={() => handleControl({x:0, y:1})} className="w-16 h-16 bg-purple-900/30 border border-purple-500/50 rounded-xl flex items-center justify-center text-2xl active:scale-95 transition-all">▼</button>
        <button onClick={() => handleControl({x:1, y:0})} className="w-16 h-16 bg-purple-900/30 border border-purple-500/50 rounded-xl flex items-center justify-center text-2xl active:scale-95 transition-all">▶</button>
      </div>
    </div>
  );
};

export default CyberSnake;
