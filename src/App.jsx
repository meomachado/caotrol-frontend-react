// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Tutores from './pages/Tutores/Tutores'; // <-- Import que você já tem

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
          
          {/* ✅ ROTA ADICIONADA AQUI 👇 */}
          <Route path="tutores" element={<Tutores />} />

          {/* Adicione outras rotas aqui no futuro */}
        </Route>

        <Route path="*" element={<div>404 - Página Não Encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default App;