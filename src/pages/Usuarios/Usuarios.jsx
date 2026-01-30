import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import api from '../../services/api';
import styles from './Usuarios.module.css';
import UsuarioModal from './UsuarioModal';
import VeterinarioModal from '../Veterinarios/VeterinarioModal';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { FaUserPlus, FaUserMd, FaUsers, FaPencilAlt, FaTrash, FaQuestionCircle } from "react-icons/fa";
import HelpModal from '../Help/HelpModal';
import helpButtonStyles from '../Help/HelpButton.module.css';

const MySwal = withReactContent(Swal);

function Usuarios() {
  const navigate = useNavigate();
  // --- VERIFICAÇÃO DE PERMISSÃO ---
  const userType = localStorage.getItem('user_type');
  const isAdmin = userType === 'admin';
  // -------------------------------

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

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpContent, setHelpContent] = useState(null);
  const [helpLoading, setHelpLoading] = useState(false);

  // --- BLOQUEIO TOTAL (OPCIONAL) ---
  // Se você decidir que veterinário NÃO DEVE NEM VER A PÁGINA,
  // descomente este useEffect:
  // /*
  // useEffect(() => {
  //   if (!isAdmin) {
  //     toast.error("Acesso não autorizado.");
  //     navigate("/home"); // ou para onde for a home do vet
  //   }
  // }, [isAdmin, navigate]);
  // */
  // ---------------------------------

  const handleOpenHelp = async () => {
    setHelpLoading(true);
    try {
      const data = await api.getHelpContent('usuarios-gestao'); 
      setHelpContent(data);
      setIsHelpModalOpen(true);
    } catch (err) {
      console.error("Erro ao buscar ajuda:", err);
      toast.error(err.message || "Não foi possível carregar o tópico de ajuda.");
    } finally {
      setHelpLoading(false);
    }
  };

  const fetchUsuarios = useCallback(async (page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 10 }).toString();
      const response = await api.getUsuarios(params);
      setUsuarios(Array.isArray(response.data) ? response.data : []);
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
      setVeterinarios(Array.isArray(response.data) ? response.data : []);
      setVetTotalPages(response.totalPages || 0);
      setVetCurrentPage(response.currentPage || 1);
    } catch (err) {
      setError('Falha ao carregar perfis de veterinários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Se você optou pelo bloqueio total acima, nem precisa carregar isso aqui.
    // Mas se for deixar em modo leitura, mantemos o carregamento.
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
  };

  const handleDeleteUser = async (id, login) => {
      MySwal.fire({
       title: 'Desativar Usuário?',
       text: `Tem certeza que deseja desativar o usuário "${login}"?`,
       icon: 'warning',
       showCancelButton: true,
       confirmButtonColor: '#d33',
       cancelButtonColor: '#6c757d',
       confirmButtonText: 'Sim, desativar',
       cancelButtonText: 'Cancelar'
      }).then(async (result) => {
       if (result.isConfirmed) {
        try {
         await api.deleteUsuario(id);
         toast.success('Usuário desativado com sucesso!');
         fetchUsuarios(userCurrentPage);
        } catch (err) {
         toast.error(err.response?.data?.message || 'Erro ao desativar usuário.');
        }
       }
      });
     };

     const handleDeleteVet = async (id, nome) => {
        MySwal.fire({
         title: 'Excluir Perfil?',
         text: `Deseja mesmo excluir o perfil de "${nome}"? Esta ação é irreversível.`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#d33',
         cancelButtonColor: '#6c757d',
         confirmButtonText: 'Sim, excluir',
         cancelButtonText: 'Cancelar'
        }).then(async (result) => {
         if (result.isConfirmed) {
          try {
           await api.deleteVeterinario(id);
           toast.success('Perfil de veterinário excluído com sucesso!');
           fetchVeterinarios(vetCurrentPage);
          } catch (err) {
           toast.error(err.response?.data?.message || 'Erro ao excluir perfil de veterinário.');
          }
         }
        });
       };


  const renderContent = () => {
    if (loading) return <p className={styles.loadingState}>Carregando...</p>;
    if (error) return <p className={styles.errorState}>{error}</p>;

    if (activeTab === 'usuarios') {
      if (!usuarios || usuarios.length === 0) return <p className={styles.noData}>Nenhum usuário encontrado.</p>;
      return usuarios.map((user) => (
        <div key={user.id_usuario} className={`${styles.itemCard} ${styles.userItem}`}>
          <div className={styles.infoWrapper}>
            <div className={styles.avatar}>
              {user.login.charAt(0).toUpperCase()}
            </div>
            <div className={styles.info}>
              <h4>{user.login}</h4>
              <p>
                <span className={styles.typeBadge}>{user.tipo}</span>
              </p>
            </div>
          </div>
          {/* SÓ MOSTRA AÇÕES SE FOR ADMIN */}
          {isAdmin && (
            <div className={styles.actions}>
                <button onClick={() => handleEditUser(user)} className={styles.iconButton} title="Editar">
                <FaPencilAlt />
                </button>
                <button onClick={() => handleDeleteUser(user.id_usuario, user.login)} className={`${styles.iconButton} ${styles.deleteButton}`} title="Desativar Usuário">
                <FaTrash />
                </button>
            </div>
          )}
        </div>
      ));
    } else {
      if (!veterinarios || veterinarios.length === 0) return <p className={styles.noData}>Nenhum perfil de veterinário encontrado.</p>;
      return veterinarios.map((vet) => (
        <div key={vet.id_veterinario} className={`${styles.itemCard} ${styles.vetItem}`}>
          <div className={styles.infoWrapper}>
            <div className={styles.avatar}>
              {vet.nome.charAt(0).toUpperCase()}
            </div>
            <div className={styles.info}>
              <h4>{vet.nome}</h4>
              <p>CRMV: {vet.crmv}</p>
            </div>
          </div>
          {/* SÓ MOSTRA AÇÕES SE FOR ADMIN */}
          {isAdmin && (
            <div className={styles.actions}>
                <button onClick={() => handleEditVet(vet)} className={styles.iconButton} title="Editar">
                <FaPencilAlt />
                </button>
                <button onClick={() => handleDeleteVet(vet.id_veterinario, vet.nome)} className={`${styles.iconButton} ${styles.deleteButton}`} title="Excluir Veterinário">
                <FaTrash />
                </button>
            </div>
          )}
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
    <> 
      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        content={helpContent}
      />

      <div className={styles.pageContainer}>
        {/* MODAIS SÓ SÃO RENDERIZADOS SE FOR ADMIN (Segurança extra) */}
        {isAdmin && (
            <>
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
            </>
        )}

        <div className={styles.pageHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div>
              <h1>Gerenciamento de Acessos</h1>
              <p className={styles.pageSubtitle}>Gerencie os usuários e perfis de veterinários do sistema</p>
            </div>
            <button 
              className={helpButtonStyles.helpIcon} 
              onClick={handleOpenHelp}
              disabled={helpLoading}
              title="Ajuda"
            >
              <FaQuestionCircle />
            </button>
          </div>
          
          {/* BOTÕES DE NOVO USUÁRIO SÓ APARECEM SE FOR ADMIN */}
          {isAdmin && (
            <div className={styles.headerActions}>
                <button className={styles.actionButtonSecondary} onClick={handleNewVet}>
                <FaUserMd /> Novo Perfil Vet
                </button>
                <button className={styles.actionButtonPrimary} onClick={handleNewUser}>
                <FaUserPlus /> Novo Usuário
                </button>
            </div>
          )}
        </div>

        <div className={styles.contentCard}>
          <div className={styles.tabs}>
            <button 
              className={activeTab === 'usuarios' ? styles.activeTab : ''} 
              onClick={() => setActiveTab('usuarios')}>
              <FaUsers /> Usuários do Sistema
            </button>
            <button 
              className={activeTab === 'veterinarios' ? styles.activeTab : ''} 
              onClick={() => setActiveTab('veterinarios')}>
              <FaUserMd /> Perfis de Veterinário
            </button>
          </div>
          
          <div className={styles.listGrid}>
            {renderContent()}
          </div>

          {renderPagination()}
        </div>
      </div>
    </>
  );
}

export default Usuarios;