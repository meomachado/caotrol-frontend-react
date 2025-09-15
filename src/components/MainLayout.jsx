// src/components/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';

function MainLayout() {
  return (
    // Não precisamos mais de um container extra, a fragmentação é suficiente
    <>
      <Sidebar />
      <Header />
      <main className={styles.pageContent}>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;