// src/pages/Animais/Animais.jsx

import React, { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./Animais.module.css";
import AnimalModal from "./AnimalModal";
import AnimalDetailModal from "./AnimalDetailModal.jsx";

function Animais() {
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  const fetchAnimais = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/animais");
      setAnimais(response || []);
    } catch (err) {
      setError("Não foi possível carregar os animais.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimais();
  }, []);

  // --- Funções para o CRUD ---
  const handleOpenDetailModal = (animal) => {
    setSelectedAnimal(animal);
    setIsDetailModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingAnimal(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (animal) => {
    setEditingAnimal(animal);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    setEditingAnimal(null);
    fetchAnimais(); // Recarrega a lista após salvar
  };

  const handleDelete = async (animalId) => {
    if (window.confirm("Tem certeza que deseja excluir este animal?")) {
      try {
        await api.delete(`/animais/${animalId}`);
        fetchAnimais(); // Recarrega a lista após deletar
      } catch (error) {
        console.error("Erro ao deletar animal:", error);
        alert("Não foi possível excluir o animal.");
      }
    }
  };

  const renderAnimalList = () => {
    if (loading) return <p>Carregando animais...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (animais.length === 0) return <p>Nenhum animal cadastrado.</p>;

    return animais.map((animal) => (
      <div key={animal.id_animal} className={styles.tutorItem}>
        <div className={styles.tutorInfo}>
          <h4>{animal.nome}</h4>
          <p>
            Espécie: {animal.raca?.especie?.nome || "N/A"} | Raça:{" "}
            {animal.raca?.nome || "N/A"} | Tutor: {animal.tutor?.nome || "N/A"}
          </p>
        </div>
        <div className={styles.tutorActions}>

        <button
            className={styles.detailsButton}
            onClick={() => handleOpenDetailModal(animal)}
          >
            Ver Detalhes
          </button>
         
          <button
            className={styles.iconButton}
            onClick={() => handleOpenEditModal(animal)}
          >
            <i className="fas fa-pencil-alt"></i>
          </button>
        
          <button
            className={`${styles.iconButton} ${styles.deleteButton}`}
            onClick={() => handleDelete(animal.id_animal)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.tutoresContainer}>
      {/* Renderização condicional do Modal */}
      {isModalOpen && (
        <AnimalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          animalToEdit={editingAnimal}
        />
      )}
      <AnimalDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        animal={selectedAnimal}
      />

      <div className={styles.pageHeader}>
        <h1>Animais</h1>
      </div>
      <div className={styles.actionsBar}>
        <input
          type="text"
          placeholder="Buscar por nome do animal ou tutor..."
          className={styles.searchInput}
        />
        <button
          className={styles.newTutorButton}
          onClick={handleOpenCreateModal}
        >
          <i className="fas fa-plus"></i>   Novo Animal  
        </button>
      </div>

      <div className={styles.tutorList}>{renderAnimalList()}</div>
    </div>
  );
}

export default Animais;
