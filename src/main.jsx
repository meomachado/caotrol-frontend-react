// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Importe o componente App
import './index.css'; // Mantenha seus estilos globais

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App /> {/* Renderize o componente App aqui */}
  </React.StrictMode>,
);