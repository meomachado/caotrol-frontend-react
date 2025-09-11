import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import styles from './Usuarios.module.css';
import UsuarioModal from './UsuarioModal';
import VeterinarioModal from '../Veterinarios/VeterinarioModal';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(0);

  const [veterinarios, setVeterinarios] = useState([]);
  const [vetCurrentPage, setVetCurrentPage] = useState(1);
  const [vetTotalPages, setVetTotalPages] = useState(0);

  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false);
  const [isVetModalOpen, setIsVetModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingVet, setEditingVet] = useState(null);

  const [activeTab, setActiveTab] = useState('usuarios');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsuarios = useCallback(async (page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 10 }).toString();
      const response = await api.getUsuarios(params);
      setUsuarios(response.data || []);
      setUserTotalPages(response.totalPages || 0);
      setUserCurrentPage(response.currentPage || 1);
    } catch (err) {
      setError(err.message.includes('403') ? 'Acesso negado.' : 'Falha ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVeterinarios = useCallback(async (page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 10 }).toString();
      const response = await api.getVeterinarios(params);
      setVeterinarios(response.data || []);
      setVetTotalPages(response.totalPages || 0);
      setVetCurrentPage(response.currentPage || 1);
    } catch (err) {
      setError('Falha ao carregar perfis de veterinários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'usuarios') {
      fetchUsuarios(userCurrentPage);
    } else {
      fetchVeterinarios(vetCurrentPage);
    }
  }, [activeTab, userCurrentPage, vetCurrentPage, fetchUsuarios, fetchVeterinarios]);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsUsuarioModalOpen(true);
  };

  const handleEditVet = (vet) => {
    setEditingVet(vet);
    setIsVetModalOpen(true);
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setIsUsuarioModalOpen(true);
  };

  const handleNewVet = () => {
    setEditingVet(null);
    setIsVetModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsUsuarioModalOpen(false);
    setIsVetModalOpen(false);
  };

  const handleSave = () => {
    handleCloseModals();
    if (activeTab === 'usuarios') {
      fetchUsuarios(1);
    } else {
      fetchVeterinarios(1);
    }
    // Aqui você pode adicionar um "toast" de sucesso.
  };

  const renderContent = () => {
    if (loading) return <p className={styles.centeredMessage}>Carregando...</p>;
    if (error) return <p className={`${styles.centeredMessage} ${styles.errorMessage}`}>{error}</p>;

    if (activeTab === 'usuarios') {
        if (!usuarios || usuarios.length === 0) return <p className={styles.centeredMessage}>Nenhum usuário encontrado.</p>;
        return usuarios.map((user) => (
            <div key={user.id_usuario} className={styles.userItem}>
                <div className={styles.userInfoWrapper}>
                    <div className={styles.userAvatar}>
                        {user.login.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.userInfo}>
                        <h4>{user.login}</h4>
                        <p>
                            <span className={styles.userType}>{user.tipo}</span>
                        </p>
                    </div>
                </div>
                <div className={styles.userActions}>
                    <button onClick={() => handleEditUser(user)} className={styles.iconButton} title="Editar">
                        <i className="fas fa-pencil-alt"></i>
                    </button>
                </div>
            </div>
        ));
    } else {
        if (!veterinarios || veterinarios.length === 0) return <p className={styles.centeredMessage}>Nenhum perfil de veterinário encontrado.</p>;
        return veterinarios.map((vet) => (
            <div key={vet.id_veterinario} className={styles.userItem}>
                <div className={styles.userInfoWrapper}>
                    <div className={styles.userAvatar}>
                        {vet.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.userInfo}>
                        <h4>{vet.nome}</h4>
                        <p>CRMV: {vet.crmv}</p>
                    </div>
                </div>
                <div className={styles.userActions}>
                    <button onClick={() => handleEditVet(vet)} className={styles.iconButton} title="Editar">
                         <i className="fas fa-pencil-alt"></i>
                    </button>
                </div>
            </div>
        ));
    }
  };
  
  const renderPagination = () => {
    const currentPage = activeTab === 'usuarios' ? userCurrentPage : vetCurrentPage;
    const totalPages = activeTab === 'usuarios' ? userTotalPages : vetTotalPages;
    const setCurrentPage = activeTab === 'usuarios' ? setUserCurrentPage : setVetCurrentPage;

    if (totalPages <= 1) return null;

    return (
      <div className={styles.paginationControls}>
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
          Próxima
        </button>
      </div>
    );
  };

  return (
    <div className={styles.usuariosContainer}>
      <UsuarioModal 
        isOpen={isUsuarioModalOpen}
        onClose={handleCloseModals}
        onSave={handleSave}
        initialData={editingUser}
      />
      <VeterinarioModal
        isOpen={isVetModalOpen}
        onClose={handleCloseModals}
        onSave={handleSave}
        initialData={editingVet}
      />

      <div className={styles.header}>
        <h1>Gerenciamento de Acessos</h1>
        <div className={styles.headerActions}>
          <button className={styles.actionButton} onClick={handleNewVet}>
            <i className="fas fa-user-md"></i> Novo Perfil Vet
          </button>
          <button className={styles.newUserButton} onClick={handleNewUser}>
            <i className="fas fa-plus"></i> Novo Usuário
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={activeTab === 'usuarios' ? styles.activeTab : ''} 
          onClick={() => setActiveTab('usuarios')}>
          <i className="fas fa-users"></i> Usuários do Sistema
        </button>
        <button 
          className={activeTab === 'veterinarios' ? styles.activeTab : ''} 
          onClick={() => setActiveTab('veterinarios')}>
          <i className="fas fa-user-md"></i> Perfis de Veterinário
        </button>
      </div>
      
      <div className={styles.userList}>
        {renderContent()}
      </div>

      {renderPagination()}
    </div>
  );
}

export default Usuarios;