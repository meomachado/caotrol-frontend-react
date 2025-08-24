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

  // ✅ 1. Estados para controle da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // ✅ 2. Função de busca agora inclui a página
  const fetchTutores = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);
      const url = `/tutores?busca=${busca}&page=${page}&limit=10`;
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
  }, [busca]);

  // ✅ 3. useEffect agora depende da página atual
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTutores(currentPage);
    }, 500);
    return () => clearTimeout(timer);
  }, [busca, currentPage, fetchTutores]);

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
    fetchTutores(1); // Volta para a primeira página para ver o novo item
  };

  const handleDelete = async (tutorId) => {
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
    if (tutores.length === 0) return <p>Nenhum tutor encontrado.</p>;

    return tutores.map((tutor) => (
      <div key={tutor.id_tutor} className={styles.tutorItem}>
        <div className={styles.tutorInfo}>
          <h4>{tutor.nome}</h4>
          <p>CPF: {tutor.cpf}</p>
        </div>
        <div className={styles.tutorActions}>
          <button className={styles.detailsButton} onClick={() => handleOpenDetailModal(tutor)}>Ver detalhes</button>
          <button className={styles.iconButton} onClick={() => handleOpenEditModal(tutor)}><i className="fas fa-pencil-alt"></i></button>
          <button className={`${styles.iconButton} ${styles.deleteButton}`} onClick={() => handleDelete(tutor.id_tutor)}><i className="fas fa-times"></i></button>
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.tutoresContainer}>
      {isModalOpen && <TutorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} tutorToEdit={editingTutor} />}
      <TutorDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} tutor={selectedTutor} />

      <div className={styles.pageHeader}><h1>Tutores</h1></div>
      <div className={styles.actionsBar}>
        <input type="text" placeholder="Buscar por nome ou CPF do Tutor(a)..." className={styles.searchInput} value={busca} onChange={(e) => setBusca(e.target.value)} />
        <button className={styles.newTutorButton} onClick={handleOpenCreateModal}><i className="fas fa-plus"></i> Novo Tutor(a)</button>
      </div>

      <div className={styles.tutorList}>{renderTutorList()}</div>

      {/* ✅ 4. Controles de Paginação */}
      <div className={styles.paginationControls}>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Anterior</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</button>
      </div>
    </div>
  );
}

export default Tutores;