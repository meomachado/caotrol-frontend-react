// pages/Usuarios/Usuarios.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import styles from './Usuarios.module.css';
import UsuarioModal from './UsuarioModal';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsuarios = useCallback(async (page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 10 }).toString();
      const response = await api.getUsuarios(params);
      setUsuarios(response.data || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.currentPage || 1);
    } catch (err) {
      if (err.message.includes('403')) {
        setError('Acesso negado. Apenas administradores podem ver esta página.');
      } else {
        setError('Não foi possível carregar os usuários.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios(currentPage);
  }, [currentPage, fetchUsuarios]);

  const handleSave = () => {
    setIsModalOpen(false);
    fetchUsuarios(1); // Volta para a primeira página após adicionar um novo usuário
  };

  const renderUserList = () => {
    if (loading) return <p>Carregando usuários...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;
    if (usuarios.length === 0) return <p>Nenhum usuário encontrado.</p>;

    return usuarios.map((user) => (
      <div key={user.id_usuario} className={styles.userItem}>
        <div className={styles.userInfo}>
          <h4>{user.login}</h4>
          <p>Tipo: <span className={styles.userType}>{user.tipo}</span></p>
        </div>
        <div className={styles.userActions}>
          {/* Futuramente, botões de editar/excluir podem ser adicionados aqui */}
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.usuariosContainer}>
      <UsuarioModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <div className={styles.header}>
        <h1>Gerenciamento de Usuários</h1>
        <button 
            className={styles.newUserButton}
            onClick={() => setIsModalOpen(true)}
        >
            <i className="fas fa-plus"></i> Novo Usuário
        </button>
      </div>
      
      <div className={styles.userList}>
        {renderUserList()}
      </div>

      <div className={styles.paginationControls}>
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || totalPages === 0}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages || 1}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
          Próxima
        </button>
      </div>
    </div>
  );
}

export default Usuarios;