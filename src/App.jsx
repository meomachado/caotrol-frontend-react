// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Tutores from './pages/Tutores/Tutores'; 
import Animais from './pages/Animais/Animais'; 
import Agenda from './pages/Agenda/Agenda';

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('jwt_token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rotas Protegidas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          {/* Rotas aninhadas dentro do MainLayout */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
            <Route path="animais" element={<Animais />} />
          <Route path="tutores" element={<Tutores />} />
          <Route path="agenda" element={<Agenda />} />
          

          {/* Adicione outras rotas aqui no futuro */}
        </Route>

        <Route path="*" element={<div>404 - Página Não Encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default App;