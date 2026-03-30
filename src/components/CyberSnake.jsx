import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

const CyberSnake = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Ses Tanımlamaları (Doğrudan çalışan .ogg linkleri)
  const sounds = useRef({
    eat: new Howl({ src: ['https://actions.google.com/sounds/v1/foley/crunchy_bite.ogg'], html5: true, volume: 0.5 }),
    gameOver: new Howl({ src: ['https://actions.google.com/sounds/v1/human_voices/reverb_male_voice_game_over.ogg'], html5: true, volume: 0.7 }),
    click: new Howl({ src: ['https://actions.google.com/sounds/v1/foley/button_click.ogg'], html5: true, volume: 0.3 })
  });

  const gridSize = 20;
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5, type: '🍎', points: 1 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(false);

  const FOOD_TYPES = [
    { t: '🍎', p: 1, c: 0.3 }, { t: '🍐', p: 2, c: 0.1 }, { t: '🍊', p: 2, c: 0.1 }, 
    { t: '🍋', p: 3, c: 0.05 }, { t: '🍌', p: 2, c: 0.1 }, { t: '🍉', p: 4, c: 0.05 }, 
    { t: '🍇', p: 3, c: 0.05 }, { t: '🍓', p: 5, c: 0.03 }, { t: '🍒', p: 5, c: 0.03 }, 
    { t: '🍍', p: 6, c: 0.02 }, { t: '🥝', p: 4, c: 0.04 }, { t: '🍅', p: 2, c: 0.1 }, 
    { t: '🥑', p: 7, c: 0.02 }, { t: '🍆', p: 3, c: 0.05 }, { t: '🥔', p: 1, c: 0.1 }, 
    { t: '🥕', p: 2, n: 0.1 }, { t: '🌽', p: 3, c: 0.05 }, { t: '🌶️', p: 10, c: 0.01 }, 
    { t: '⭐', p: 15, c: 0.01 }, { t: '💎', p: 25, c: 0.005 }
  ];

  const getRandomFood = useCallback(() => {
    const rand = Math.random();
    let cumulative = 0;
    const type = FOOD_TYPES.find(f => (cumulative += f.c) > rand) || FOOD_TYPES[0];
    return {
      x: Math.floor(Math.random() * 19),
      y: Math.floor(Math.random() * 19),
      type: type.t,
      points: type.p
    };
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || (direction.x === 0 && direction.y === 0)) return;

    setSnake(prevSnake => {
      const newHead = { x: prevSnake[0].x + direction.x, y: prevSnake[0].y + direction.y };

      // Çarpışma Kontrolü
      if (newHead.x < 0 || newHead.x >= 20 || newHead.y < 0 || newHead.y >= 20 || 
          prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        setGameOver(true);
        sounds.current.gameOver.play();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Yemek Yeme
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + food.points);
        sounds.current.eat.play();
        setFood(getRandomFood());
      } else {
        newSnake.pop();
      }
      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, getRandomFood]);

  useEffect(() => {
    const interval = setInterval(moveSnake, 130);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 400, 400);

    // Yılan Çizimi (Neon Yeşil)
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff00';
    ctx.fillStyle = '#00ff00';
    snake.forEach(p => ctx.fillRect(p.x * gridSize, p.y * gridSize, gridSize - 2, gridSize - 2));

    // Yemek Çizimi
    ctx.shadowColor = '#bc13fe';
    ctx.font = '16px Arial';
    ctx.fillText(food.type, food.x * gridSize + 2, food.y * gridSize + 16);
  }, [snake, food]);

  const handleDir = (x, y) => {
    if ((x === -direction.x && x !== 0) || (y === -direction.y && y !== 0)) return;
    sounds.current.click.play();
    setDirection({ x, y });
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(getRandomFood());
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-black text-[#bc13fe] italic uppercase tracking-tighter">Cyber Snake v4</h1>
        <p className="text-green-400 font-mono text-2xl">Score: {score}</p>
      </div>

      <div className="relative border-2 border-[#bc13fe] shadow-[0_0_15px_#bc13fe] rounded-lg overflow-hidden bg-black/50">
        <canvas ref={canvasRef} width={400} height={400} className="max-w-full h-auto" />
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <h2 className="text-4xl font-bold text-red-500 mb-6">GAME OVER</h2>
            <button onClick={resetGame} className="px-10 py-3 bg-[#bc13fe] text-white rounded-full font-bold active:scale-90 transition-transform">RESTART</button>
          </div>
        )}
      </div>

      {/* TABLET KONTROLLERİ */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div />
        <button onClick={() => handleDir(0, -1)} className="w-16 h-16 bg-purple-900/40 border border-purple-500/50 rounded-2xl flex items-center justify-center text-3xl text-white active:bg-purple-600">▲</button>
        <div />
        <button onClick={() => handleDir(-1, 0)} className="w-16 h-16 bg-purple-900/40 border border-purple-500/50 rounded-2xl flex items-center justify-center text-3xl text-white active:bg-purple-600">◀</button>
        <button onClick={() => handleDir(0, 1)} className="w-16 h-16 bg-purple-900/40 border border-purple-500/50 rounded-2xl flex items-center justify-center text-3xl text-white active:bg-purple-600">▼</button>
        <button onClick={() => handleDir(1, 0)} className="w-16 h-16 bg-purple-900/40 border border-purple-500/50 rounded-2xl flex items-center justify-center text-3xl text-white active:bg-purple-600">▶</button>
      </div>
    </div>
  );
};

export default CyberSnake;
