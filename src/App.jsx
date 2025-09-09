// src/App.jsx
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
import Veterinarios from './pages/Veterinarios/Veterinarios'; 

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("jwt_token"); 
  //ele verifica se o token de seguranca existe quando um usuario realizou o login
  return isAuthenticated ? children : <Navigate to="/login" replace />; //aqui funciona como um if/else 
  //Se isAuthenticated for verdadeiro (ou seja, o token existe), então mostre os componentes filhos (children). 
  //Se for falso (token não existe), redirecione o usuário para a página /login
}; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />  
        {/*path é o caminho que ele vai colocar na URL*/}
        {/* é o componente que ele vai exibir - Login.jsx nesse caso */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
          //basicamente http://localhost:3000/ te manda pra dashboard sem necessariamente ter a   
          //palavra dashboar depois da barra 
        

        {/* Rotas Protegidas */}
        <Route
          path="/" // essa é a rota principal que esta envolvida no privateRoute
          //ela so sera acessada se o usuario estiver logado
          element={  
            <PrivateRoute> 
              <MainLayout />
            </PrivateRoute>
          }
        >
          {/* Rotas aninhadas dentro do MainLayout */}
          {/*essas rotas estao aninhadas, ou seja, todas elas serao renderizadas dentro
             do main layout */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="animais" element={<Animais />} />
          <Route path="tutores" element={<Tutores />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="consultas" element={<Consulta />} />
          <Route path="animais/:id" element={<AnimalDetailPage />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="veterinarios" element={<Veterinarios />} />
          


          {/* Adicione outras rotas aqui no futuro */}
        </Route>

        <Route path="*" element={<div>404 - Página Não Encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default App;
