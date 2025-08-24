import React, { useState, useEffect, useCallback } from "react";
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
  const [busca, setBusca] = useState("");

  // ✅ 1. Estados para controle da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // ✅ 2. Função de busca agora inclui a página
  const fetchAnimais = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);
      // A URL agora inclui os parâmetros de busca e página
      const url = `/animais?busca=${busca}&page=${page}&limit=10`;
      const response = await api.get(url);
      
      // A resposta do backend é um objeto com os dados e a paginação
      setAnimais(response.data || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.currentPage || 1);
    } catch (err) {
      setError("Não foi possível carregar os animais.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [busca]); // Recria a função se o termo de busca mudar

  // ✅ 3. useEffect agora depende da página atual
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnimais(currentPage);
    }, 500);
    return () => clearTimeout(timer);
  }, [busca, currentPage, fetchAnimais]);

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
    fetchAnimais(currentPage); // Recarrega a página atual
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
    if (animais.length === 0) return <p>Nenhum animal encontrado.</p>;

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
          <button className={styles.detailsButton} onClick={() => handleOpenDetailModal(animal)}>Ver Detalhes</button>
          <button className={styles.iconButton} onClick={() => handleOpenEditModal(animal)}><i className="fas fa-pencil-alt"></i></button>
          <button className={`${styles.iconButton} ${styles.deleteButton}`} onClick={() => handleDelete(animal.id_animal)}><i className="fas fa-times"></i></button>
        </div>
      </div>
    ));
  };

  return (
    <div className={styles.tutoresContainer}>
      {isModalOpen && <AnimalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} animalToEdit={editingAnimal} />}
      <AnimalDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} animal={selectedAnimal} />

      <div className={styles.pageHeader}><h1>Animais</h1></div>
      <div className={styles.actionsBar}>
        <input type="text" placeholder="Buscar por nome do animal..." className={styles.searchInput} value={busca} onChange={(e) => setBusca(e.target.value)} />
        <button className={styles.newTutorButton} onClick={handleOpenCreateModal}><i className="fas fa-plus"></i> Novo Animal</button>
      </div>

      <div className={styles.tutorList}>{renderAnimalList()}</div>

      {/* ✅ 4. Controles de Paginação */}
      <div className={styles.paginationControls}>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Anterior</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</button>
      </div>
    </div>
  );
}

export default Animais;