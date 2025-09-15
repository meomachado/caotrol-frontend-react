// src/pages/Tutores/Tutores.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import styles from "./Tutores.module.css";
import TutorModal from "./TutorModal";
import AnimalModal from "../Animais/AnimalModal";
import { useNavigate } from "react-router-dom";
// ✅ Ícones do React-Icons
import { FaPlus, FaSearch } from "react-icons/fa";

function Tutores() {
  const [tutores, setTutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false);
  const [tutorParaNovoAnimal, setTutorParaNovoAnimal] = useState(null);
  const [busca, setBusca] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [ordenarPor, setOrdenarPor] = useState("id_desc");
  const navigate = useNavigate();

  const fetchTutores = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ busca, page, limit: 10, ordenarPor }).toString();
      const response = await api.get(`/tutores?${params}`);
      setTutores(response.data || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.currentPage || 1);
    } catch (err) {
      setError("Não foi possível carregar os tutores.");
    } finally {
      setLoading(false);
    }
  }, [busca, ordenarPor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTutores(currentPage);
    }, 500);
    return () => clearTimeout(timer);
  }, [busca, currentPage, fetchTutores]);

  const handleOpenCreateModal = () => {
    setIsTutorModalOpen(true);
  };
  
  const handleNavigateToDetail = (tutorId) => {
    navigate(`/tutores/${tutorId}`);
  };

  const handleSaveTutor = (action, novoTutor) => {
    setIsTutorModalOpen(false);
    fetchTutores(1);

    if (action === 'saveAndAddAnimal' && novoTutor) {
      setTutorParaNovoAnimal(novoTutor);
      setIsAnimalModalOpen(true);
    }
  };

  const handleSaveAnimal = () => {
    setIsAnimalModalOpen(false);
    setTutorParaNovoAnimal(null);
    alert("Animal cadastrado com sucesso!");
  };

  const formatCPF = (value) => {
    if (!value) return "";
    return value.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const renderTutorList = () => {
    if (loading) return <div className={styles.loadingState}>Carregando tutores...</div>;
    if (error) return <div className={styles.errorState}>{error}</div>;
    if (tutores.length === 0) return <div className={styles.noData}>Nenhum tutor encontrado.</div>;

    return tutores.map((tutor) => (
      <div key={tutor.id_tutor} className={styles.tutorItem}>
        <div className={styles.tutorInfoWrapper}>
          <div className={styles.tutorAvatar}>{tutor.nome.charAt(0).toUpperCase()}</div>
          <div className={styles.tutorInfo}>
            <h4>{tutor.nome}</h4>
            <p>CPF: {formatCPF(tutor.cpf)}</p>
          </div>
        </div>
        <button className={styles.detailsButton} onClick={() => handleNavigateToDetail(tutor.id_tutor)}>Ver detalhes</button>
      </div>
    ));
  };

  return (
    <div className={styles.pageContainer}>
      <TutorModal isOpen={isTutorModalOpen} onClose={() => setIsTutorModalOpen(false)} onSave={handleSaveTutor} />
      <AnimalModal isOpen={isAnimalModalOpen} onClose={() => setIsAnimalModalOpen(false)} onSave={handleSaveAnimal} tutorToPreselect={tutorParaNovoAnimal} />
      
      {/* ✅ HEADER PADRONIZADO */}
      <div className={styles.pageHeader}>
        <div>
            <h1>Tutores</h1>
            <p className={styles.pageSubtitle}>Liste, busque e gerencie os tutores</p>
        </div>
        <button className={styles.actionButtonPrimary} onClick={handleOpenCreateModal}>
          <FaPlus /> Novo Tutor
        </button>
      </div>

      {/* ✅ FILTROS UNIFICADOS */}
      <div className={styles.filterContainer}>
        <div className={styles.searchGroup}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..." 
              className={styles.searchInput} 
              value={busca} 
              onChange={(e) => setBusca(e.target.value)} 
            />
        </div>
        <div className={styles.filterGroup}>
            <label htmlFor="sort">Ordenar por:</label>
            <select id="sort" value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
                <option value="id_desc">Mais Recentes</option>
                <option value="nome_asc">Nome (A-Z)</option>
                <option value="nome_desc">Nome (Z-A)</option>
            </select>
        </div>
      </div>
      
      <div className={styles.tutorList}>
        {renderTutorList()}
      </div>
      
      {totalPages > 0 && (
        <div className={styles.paginationControls}>
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Anterior</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</button>
        </div>
      )}
    </div>
  );
}

export default Tutores;