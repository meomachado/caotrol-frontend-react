import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
import logoImage from "../assets/logo.png";

function Sidebar() {
  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarLogo}>
        <img src={logoImage} alt="Lauro Vet Logo" />
      </div>
      <nav className={styles.sidebarNav}>
        <ul>
          {/* Adicionamos a propriedade 'end' aqui 👇 */}
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
          <li>
            <NavLink to="/relatorios">
              <i className="fas fa-chart-line"></i> Relatórios
            </NavLink>
          </li>
          <li>
            <NavLink to="/veterinarios">
              <i className="fas fa-user-md"></i> Usuários
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
