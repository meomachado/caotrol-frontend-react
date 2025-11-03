// src/pages/Animais/Animais.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import styles from "./Animais.module.css";
import AnimalModal from "./AnimalModal";
import { useNavigate } from 'react-router-dom';

// --- ÍCONES MODIFICADOS ---
import { FaPlus, FaSearch, FaDog, FaCat, FaPaw, FaQuestionCircle } from "react-icons/fa";

// --- NOVAS IMPORTAÇÕES ---
import HelpModal from "../Help/HelpModal";
import helpButtonStyles from "../Help/HelpButton.module.css";
// -------------------------

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
  const [ordenarPor, setOrdenarPor] = useState("id_desc");

  // --- NOVOS ESTADOS DE AJUDA ---
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpContent, setHelpContent] = useState(null);
  const [helpLoading, setHelpLoading] = useState(false);
  // ------------------------------

  // --- NOVA FUNÇÃO DE AJUDA ---
  const handleOpenHelp = async () => {
    setHelpLoading(true);
    try {
      // Usando a "pageKey" 'animais-lista'
      const data = await api.getHelpContent('animais-lista'); 
      setHelpContent(data);
      setIsHelpModalOpen(true);
    } catch (err) {
      console.error("Erro ao buscar ajuda:", err);
      setError(err.message || "Não foi possível carregar o tópico de ajuda.");
    } finally {
      setHelpLoading(false);
    }
  };
  // ----------------------------

  const fetchAnimais = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);
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

  const handleSave = () => {
    setIsModalOpen(false);
    setEditingAnimal(null);
    fetchAnimais(currentPage);
  };

  const getSpeciesIcon = (speciesName) => {
    const name = speciesName?.toLowerCase() || '';
    if (name.includes('canina')) {
      return <FaDog />;
    }
    if (name.includes('felina')) {
      return <FaCat />;
    }
    return <FaPaw />;
  };

  const renderAnimalList = () => {
    if (loading) return <div className={styles.loadingState}>Carregando animais...</div>;
    // Corrigido: Mostrar o erro no local certo
    if (error) return <div className={styles.errorState}>{error}</div>;
    if (animais.length === 0) return <div className={styles.noData}>Nenhum animal encontrado.</div>;

    return animais.map((animal) => (
      <div key={animal.id_animal} className={styles.animalItem}>
        <div className={styles.animalInfoWrapper}>
          <div className={styles.animalAvatar}>
            {getSpeciesIcon(animal.raca?.especie?.nome)}
          </div>
          <div className={styles.animalInfo}>
            <h4>{animal.nome}</h4>
            <p>
              Tutor: {animal.tutor?.nome || "N/A"} | Raça: {animal.raca?.nome || "N/A"}
            </p>
          </div>
        </div>
        <button className={styles.detailsButton} onClick={() => handleNavigateToDetail(animal.id_animal)}>
          Ver Detalhes
        </button>
      </div>
    ));
  };

  return (
    <> {/* Adicionado Fragment */}
      {/* MODAL DE AJUDA */}
      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        content={helpContent}
      />

      <div className={styles.pageContainer}>
        {isModalOpen && <AnimalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} animalToEdit={editingAnimal} />}
      
        {/* HEADER MODIFICADO */}
        <div className={styles.pageHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div>
              <h1>Animais</h1>
              <p className={styles.pageSubtitle}>Gerencie os pacientes da clínica</p>
            </div>
            {/* BOTÃO DE AJUDA ADICIONADO AQUI */}
            <button 
              className={helpButtonStyles.helpIcon} 
              onClick={handleOpenHelp}
              disabled={helpLoading}
              title="Ajuda"
            >
              <FaQuestionCircle />
            </button>
          </div>
          <button className={styles.actionButtonPrimary} onClick={handleOpenCreateModal}>
            <FaPlus /> Novo Animal
          </button>
        </div>

        {/* ... (Resto do seu JSX: filterContainer, animalList, etc.) ... */}
        <div className={styles.filterContainer}>
          <div className={styles.searchGroup}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Buscar por nome do animal ou tutor..." 
              className={styles.searchInput} 
              value={busca} 
              onChange={(e) => setBusca(e.target.value)} 
            />
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="sort">Ordenar por:</label>
            <select id="sort" value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
              <option value="id_desc">Mais Recentes</option>
              <option value="id_asc">Mais Antigos</option>
              <option value="nome_asc">Nome (A-Z)</option>
              <option value="nome_desc">Nome (Z-A)</option>
            </select>
          </div>
        </div>

        <div className={styles.animalList}>
          {renderAnimalList()}
        </div>

        {totalPages > 0 && (
          <div className={styles.paginationControls}>
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Anterior</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</button>
          </div>
        )}
      </div>
    </>
  );
}

export default Animais;