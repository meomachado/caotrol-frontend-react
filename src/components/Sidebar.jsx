import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
import logoImage from "../assets/logo.png";

function Sidebar() {
  // 1. Recupera o tipo de usuário salvo no login
  const userType = localStorage.getItem('user_type');

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarLogo}>
        <a href="/dashboard" target="_self" rel="noopener noreferrer">
          <img src={logoImage} alt="Lauro Vet Logo" />
        </a>
      </div>
      
      <nav className={styles.sidebarNav}>
        <ul>
          <li>
            <NavLink to="/dashboard" end>
              <i className="fas fa-home"></i> Início
            </NavLink>
          </li>
          <li>
            <NavLink to="/agenda">
              <i className="fas fa-calendar-alt"></i> Agenda
            </NavLink>
          </li>
          <li>
            <NavLink to="/tutores">
              <i className="fas fa-user-friends"></i> Tutores
            </NavLink>
          </li>
          <li>
            <NavLink to="/animais">
              <i className="fas fa-paw"></i> Animais
            </NavLink>
          </li>
          <li>
            <NavLink to="/consultas">
              <i className="fas fa-notes-medical"></i> Consultas
            </NavLink>
          </li>

          {/* 2. CONDIÇÃO: Apenas 'admin' vê o menu de Usuários */}
          {userType === 'admin' && (
            <li>
              <NavLink to="/usuarios">
                <i className="fas fa-users-cog"></i> Usuários
              </NavLink>
            </li>
          )}
          
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;