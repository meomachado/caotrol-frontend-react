// src/pages/Tutores/Tutores.jsx

import React, { useState, useEffect } from "react";
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

  const fetchTutores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/tutores");
      console.log(response);
      setTutores(response.data  || []);
    
    } catch (err) {
      setError("Não foi possível carregar os tutores.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutores();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingTutor(null); // Garante que não há um tutor em edição
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tutor) => {
    setEditingTutor(tutor); // Define qual tutor será editado
    setIsModalOpen(true);
  };
  const handleOpenDetailModal = (tutor) => {
    setSelectedTutor(tutor);
    setIsDetailModalOpen(true);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    setEditingTutor(null); // Limpa o estado de edição
    fetchTutores();
  };
  const handleDelete = async (tutorId) => {
    // Pede confirmação ao usuário
    if (
      window.confirm(
        "Tem certeza que deseja excluir este tutor? Esta ação não pode ser desfeita."
      )
    ) {
      try {
        // Chama a API para deletar o tutor
        await api.delete(`/tutores/${tutorId}`);
        // Atualiza a lista de tutores na tela
        fetchTutores();
      } catch (error) {
        console.error("Erro ao deletar tutor:", error);
        alert("Não foi possível excluir o tutor.");
      }
    }
  };
  const renderTutorList = () => {
    if (loading) return <p>Carregando tutores...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (tutores.length === 0) return <p>Nenhum tutor cadastrado.</p>;

    return tutores.map((tutor) => (
      <div key={tutor.id_tutor} className={styles.tutorItem}>
        <div className={styles.tutorInfo}>
          <h4>{tutor.nome}</h4>
          <p>CPF: {tutor.cpf}</p>
        </div>
        <div className={styles.tutorActions}>
          <button
            className={styles.detailsButton}
            onClick={() => handleOpenDetailModal(tutor)}
          >
            Ver detalhes
          </button>
          <button
            className={styles.iconButton}
            onClick={() => handleOpenEditModal(tutor)}
          >
            <i className="fas fa-pencil-alt"></i> {/* Ícone de Lápis */}
          </button>
          <button
            className={`${styles.iconButton} ${styles.deleteButton}`}
            onClick={() => handleDelete(tutor.id_tutor)}
          >
            <i className="fas fa-times"></i> {/* Ícone de X */}
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.tutoresContainer}>
      {/* ADIÇÃO 2: Componente do Modal sendo renderizado */}
      {isModalOpen && (
        <TutorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          tutorToEdit={editingTutor} /* ✅ A PROP QUE FALTAVA ✅ */
        />
      )}
      <TutorDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        tutor={selectedTutor}
      />

      <div className={styles.pageHeader}>
        <h1>Tutores</h1> {/* Título mais simples como no protótipo */}
      </div>
      <div className={styles.actionsBar}>
        {" "}
        {/* Nova div para a barra de ações */}
        <input
          type="text"
          placeholder="Buscar por nome ou CPF do Tutor(a)..."
          className={styles.searchInput}
        />
        {/* O botão de lupa pode ser removido se a busca for automática */}
        <button
          className={styles.newTutorButton}
          onClick={handleOpenCreateModal}
        >
          <i className="fas fa-plus"></i> Novo Tutor(a)
        </button>
      </div>
      <div className={styles.tutorList}>{renderTutorList()}</div>
    </div>
  );
}

export default Tutores;
