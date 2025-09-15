import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Tutores from "./pages/Tutores/Tutores";
import Animais from "./pages/Animais/Animais";
import Agenda from "./pages/Agenda/Agenda";
import Consulta from "./pages/Consulta/Consultas";
import AnimalDetailPage from './pages/Animais/AnimalDetailPage'; 
import Relatorios from './pages/Relatorios/Relatorios';
import Usuarios from './pages/Usuarios/Usuarios';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword'; 
import VerifyEmail from './pages/VerifyEmail';
import TutorDetailPage from './pages/Tutores/TutorDetailPage'; 

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("jwt_token"); 
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}; 

function App() {
  return (
    <Router>
      <Routes>
        {/* --- ROTAS PÚBLICAS --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route path="/resetar-senha/:token" element={<ResetPassword />} />
        <Route path="/verificar-email/:token" element={<VerifyEmail />} />

        {/* Rota raiz padrão */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* --- ROTAS PROTEGIDAS --- */}
        <Route
          path="/" 
          element={ 
            <PrivateRoute> 
              <MainLayout />
            </PrivateRoute>
          }
        >
          {/* Rotas aninhadas que precisam de login */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="animais" element={<Animais />} />
          <Route path="animais/:id" element={<AnimalDetailPage />} />
          <Route path="tutores" element={<Tutores />} />
          {/* ✅ ROTA MOVIDA PARA O LUGAR CORRETO */}
          <Route path="tutores/:id" element={<TutorDetailPage />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="consultas" element={<Consulta />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>

        {/* Rota para páginas não encontradas */}
        <Route path="*" element={<div>404 - Página Não Encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default App;