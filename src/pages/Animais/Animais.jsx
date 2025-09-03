// pages/Animais/Animais.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import styles from "./Animais.module.css";
import AnimalModal from "./AnimalModal";
import { useNavigate } from 'react-router-dom'; // 

function Animais() {
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Estado para controle da ordenação
  const [ordenarPor, setOrdenarPor] = useState("nome_asc");

  const fetchAnimais = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);
      // URL agora inclui o parâmetro de ordenação
      const url = `/animais?busca=${busca}&page=${page}&limit=10&ordenarPor=${ordenarPor}`;
      const response = await api.get(url);
      
      setAnimais(response.data || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.currentPage || 1);
    } catch (err) {
      setError("Não foi possível carregar os animais.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [busca, ordenarPor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnimais(currentPage);
    }, 500);
    return () => clearTimeout(timer);
  }, [busca, currentPage, fetchAnimais, ordenarPor]);


  const handleNavigateToDetail = (animalId) => {
    navigate(`/animais/${animalId}`);
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
    fetchAnimais(currentPage);
  };

  const handleDelete = async (animalId) => {
    if (window.confirm("Tem certeza que deseja excluir este animal?")) {
      try {
        await api.delete(`/animais/${animalId}`);
        fetchAnimais(currentPage);
      } catch (error) {
        console.error("Erro ao deletar animal:", error);
        alert("Não foi possível excluir o animal.");
      }
    }
  };

  const renderAnimalList = () => {
    if (loading) return <p>Carregando animais...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (animais.length === 0 && !loading) return <p>Nenhum animal encontrado.</p>;

    return animais.map((animal) => (
      <div key={animal.id_animal} className={styles.animalItem}>
        <div className={styles.animalInfo}>
          <h4>{animal.nome}</h4>
          <p>
            Tutor: {animal.tutor?.nome || "N/A"} | Espécie: {animal.raca?.especie?.nome || "N/A"}
          </p>
        </div>
        <div className={styles.animalActions}>
          <button className={styles.iconButton} title="Editar" onClick={() => handleOpenEditModal(animal)}><i className="fas fa-pencil-alt"></i></button>
          <button className={styles.detailsButton} onClick={() => handleNavigateToDetail(animal.id_animal)}>
            Ver Detalhes
          </button>
          <button className={`${styles.iconButton} ${styles.deleteButton}`} title="Excluir" onClick={() => handleDelete(animal.id_animal)}><i className="fas fa-trash-alt"></i></button>
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.animaisContainer}>
      {isModalOpen && <AnimalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} animalToEdit={editingAnimal} />}
    

      <div className={styles.pageHeader}>
        <h1>Animais</h1>
      </div>

      <div className={styles.actionsBar}>
        <div className={styles.searchInputContainer}>
          <i className={`fas fa-search ${styles.searchIcon}`}></i>
          <input 
            type="text" 
            placeholder="Buscar por nome do animal..." 
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
        <button className={styles.newAnimalButton} onClick={handleOpenCreateModal}>
          <i className="fas fa-plus"></i> Novo Animal
        </button>
      </div>

      <div className={styles.animalList}>
        {renderAnimalList()}
      </div>

      <div className={styles.paginationControls}>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || totalPages === 0}>Anterior</button>
        <span>Página {currentPage} de {totalPages || 1}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>Próxima</button>
      </div>
    </div>
  );
}

export default Animais;
