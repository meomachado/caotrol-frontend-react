// pages/Tutores/Tutores.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import styles from "./Tutores.module.css";
import TutorModal from "./TutorModal";
import TutorDetailModal from "./TutorDetailModal";

function Tutores() {
  const [tutores, setTutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [busca, setBusca] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [ordenarPor, setOrdenarPor] = useState("nome_asc");

  const fetchTutores = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);
      const url = `/tutores?busca=${busca}&page=${page}&limit=10&ordenarPor=${ordenarPor}`;
      const response = await api.get(url);
      
      setTutores(response.data || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.currentPage || 1);
    } catch (err) {
      setError("Não foi possível carregar os tutores.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [busca, ordenarPor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTutores(currentPage);
    }, 500);
    return () => clearTimeout(timer);
  }, [busca, currentPage, fetchTutores, ordenarPor]);

  const handleOpenCreateModal = () => {
    setEditingTutor(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tutor) => {
    setEditingTutor(tutor);
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (tutor) => {
    setSelectedTutor(tutor);
    setIsDetailModalOpen(true);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    setEditingTutor(null);
    fetchTutores(1);
  };

  const handleDelete = async (tutorId) => {
    // Substituir window.confirm por um modal customizado em uma aplicação real
    if (window.confirm("Tem certeza que deseja excluir este tutor?")) {
      try {
        await api.delete(`/tutores/${tutorId}`);
        fetchTutores(currentPage);
      } catch (error) {
        console.error("Erro ao deletar tutor:", error);
        alert("Não foi possível excluir o tutor.");
      }
    }
  };

  const renderTutorList = () => {
    if (loading) return <p>Carregando tutores...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (tutores.length === 0 && !loading) return <p>Nenhum tutor encontrado.</p>;

    return tutores.map((tutor) => (
      <div key={tutor.id_tutor} className={styles.tutorItem}>
        <div className={styles.tutorInfo}>
          <h4>{tutor.nome}</h4>
          <p>CPF: {tutor.cpf}</p>
        </div>
        <div className={styles.tutorActions}>
          <button className={styles.detailsButton} onClick={() => handleOpenDetailModal(tutor)}>Ver detalhes</button>
          <button className={styles.iconButton} title="Editar" onClick={() => handleOpenEditModal(tutor)}><i className="fas fa-pencil-alt"></i></button>
          <button className={`${styles.iconButton} ${styles.deleteButton}`} title="Excluir" onClick={() => handleDelete(tutor.id_tutor)}><i className="fas fa-trash-alt"></i></button>
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.tutoresContainer}>
      {isModalOpen && <TutorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} tutorToEdit={editingTutor} />}
      <TutorDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} tutor={selectedTutor} />

      <div className={styles.pageHeader}>
        <h1>Tutores</h1>
      </div>
      
      <div className={styles.actionsBar}>
        <div className={styles.searchInputContainer}>
            <i className={`fas fa-search ${styles.searchIcon}`}></i>
            <input 
                type="text" 
                placeholder="Buscar por nome ou CPF..." 
                className={styles.searchInput} 
                value={busca} 
                onChange={(e) => setBusca(e.target.value)} 
            />
        </div>
        <div className={styles.sortGroup}>
            <label htmlFor="sort">Ordenar por:</label>
            <select id="sort" value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
                <option value="nome_asc">Nome (A-Z)</option>
                <option value="nome_desc">Nome (Z-A)</option>
            </select>
        </div>
        <button className={styles.newTutorButton} onClick={handleOpenCreateModal}>
            <i className="fas fa-plus"></i> Novo Tutor
        </button>
      </div>

      <div className={styles.tutorList}>
        {renderTutorList()}
      </div>

      {/* ✅ CORREÇÃO: Bloco de paginação agora está sempre visível */}
      <div className={styles.paginationControls}>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || totalPages === 0}>Anterior</button>
        <span>Página {currentPage} de {totalPages || 1}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>Próxima</button>
      </div>
    </div>
  );
}

export default Tutores;
