import React from 'react';
import CyberSnake from './components/CyberSnake.jsx';
import './index.css';

function App() {
  return (
    <div className="w-full min-h-screen bg-[#050505] flex items-center justify-center">
      {/* Oyun Bileşeni */}
      <CyberSnake />
    </div>
  );
}

export default App;
