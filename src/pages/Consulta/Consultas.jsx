// src/pages/Consultas/Consultas.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import styles from "./Consultas.module.css";
import ConsultaDetailModal from "./ConsultaDetailModal";
import SelecaoAnimalModal from "./SelecaoAnimalModal";
import NovaConsultaModal from "./NovaConsultaModal";
import TutorModal from "../Tutores/TutorModal";
import AnimalModal from "../Animais/AnimalModal";
// ✅ Ícones do React-Icons importados
import { FaPlus, FaSearch, FaEye } from "react-icons/fa";

function Consultas() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [ordenacao, setOrdenacao] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [animalRecemCriado, setAnimalRecemCriado] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState(null);
  const [isSelecaoOpen, setIsSelecaoOpen] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [isNovaConsultaOpen, setIsNovaConsultaOpen] = useState(false);
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false);
  const [animalIdParaConsulta, setAnimalIdParaConsulta] = useState(null);
  const [tutorRecemCriado, setTutorRecemCriado] = useState(null);
  const [tutorParaNovoAnimal, setTutorParaNovoAnimal] = useState(null);

  const fetchConsultas = useCallback(async (page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, ordenarPor: ordenacao, busca, dataInicio, dataFim });
      if (params.get('dataInicio') === '') params.delete('dataInicio');
      if (params.get('dataFim') === '') params.delete('dataFim');
      const response = await api.get(`/consultas?${params.toString()}`);
      setConsultas(response.data || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.currentPage || 1);
    } catch (err) {
      setError("Não foi possível carregar as consultas.");
    } finally {
      setLoading(false);
    }
  }, [busca, dataInicio, dataFim, ordenacao]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConsultas(currentPage);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, fetchConsultas]);

  const handleAbrirFluxoNovaConsulta = () => {
    const userType = localStorage.getItem('user_type');
    if (userType !== 'veterinario') {
      alert('Acesso negado. Apenas veterinários podem iniciar uma consulta.');
      return;
    }
    setTutorRecemCriado(null);
    setIsSelecaoOpen(true);
  };
  
  const handleAbrirModalNovoTutor = () => {
    setIsSelecaoOpen(false);
    setIsTutorModalOpen(true);
  };

  const handleSalvarTutor = (action, novoTutor) => {
    setIsTutorModalOpen(false);
    if (action === 'saveAndAddAnimal') {
      handleAbrirModalNovoAnimal(novoTutor);
    } else {
      setTutorRecemCriado(novoTutor);
      setIsSelecaoOpen(true);
    }
  };
  
  const handleFecharModalTutor = () => {
    setIsTutorModalOpen(false);
    setIsSelecaoOpen(true);
  };

  const handleAnimalSelecionado = (animalId) => {
    setAnimalIdParaConsulta(animalId);
    setIsSelecaoOpen(false);
    setIsNovaConsultaOpen(true);
  };

  const handleFecharModalNovaConsulta = () => {
    setIsNovaConsultaOpen(false);
    setAnimalIdParaConsulta(null);
    fetchConsultas(1);
  };
  
  const handleAbrirModalNovoAnimal = (tutor) => {
    setTutorParaNovoAnimal(tutor);
    setIsSelecaoOpen(false);
    setIsAnimalModalOpen(true);
  };

  const handleSalvarAnimal = (novoAnimal) => {
    setIsAnimalModalOpen(false);
    setTutorRecemCriado(tutorParaNovoAnimal); 
    setAnimalRecemCriado(novoAnimal);
    setTutorParaNovoAnimal(null);
    setIsSelecaoOpen(true);
  };
  
  const handleOpenDetailModal = async (idConsulta) => {
    try {
      const response = await api.get(`/consultas/${idConsulta}`);
      setSelectedConsulta(response);
      setIsDetailModalOpen(true);
    } catch (err) {
      setError("Erro ao carregar detalhes da consulta.");
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const formattedDate = new Intl.DateTimeFormat("pt-BR").format(date);
    const formattedTime = new Intl.DateTimeFormat("pt-BR", { hour: '2-digit', minute: '2-digit' }).format(date);
    return `${formattedDate} às ${formattedTime}`;
  };
  
  return (
    <div className={styles.pageContainer}>
      {/* --- RENDERIZAÇÃO DE TODOS OS MODAIS --- */}
      <ConsultaDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} consulta={selectedConsulta} />
      <SelecaoAnimalModal isOpen={isSelecaoOpen} onClose={() => setIsSelecaoOpen(false)} onAnimalSelecionado={handleAnimalSelecionado} onAddNewTutor={handleAbrirModalNovoTutor} onAddNewAnimal={handleAbrirModalNovoAnimal} newlyCreatedTutor={tutorRecemCriado} newlyCreatedAnimal={animalRecemCriado}/>
      <TutorModal isOpen={isTutorModalOpen} onClose={handleFecharModalTutor} onSave={handleSalvarTutor}/>
      <AnimalModal isOpen={isAnimalModalOpen} onClose={() => {setIsAnimalModalOpen(false); setIsSelecaoOpen(true)}} onSave={handleSalvarAnimal} tutorToPreselect={tutorParaNovoAnimal}/>
      <NovaConsultaModal isOpen={isNovaConsultaOpen} onClose={handleFecharModalNovaConsulta} onSave={handleFecharModalNovaConsulta} animalId={animalIdParaConsulta} />
      
      {/* ✅ Cabeçalho e Subtítulo padronizados */}
      <div className={styles.pageHeader}>
        <div>
            <h1>Consultas</h1>
            <p className={styles.pageSubtitle}>Gerencie o histórico de atendimentos</p>
        </div>
        <button className={styles.actionButtonPrimary} onClick={handleAbrirFluxoNovaConsulta}>
          <FaPlus /> Nova Consulta
        </button>
      </div>

      {/* ✅ Barra de filtros e busca unificada */}
      <div className={styles.filterContainer}>
        <div className={styles.searchGroup}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Buscar por animal, tutor ou CPF..." 
              className={styles.searchInput} 
              value={busca} 
              onChange={(e) => setBusca(e.target.value)} 
            />
        </div>
        <div className={styles.filterGroup}>
            <label>De:</label>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div className={styles.filterGroup}>
            <label>Até:</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
        <div className={styles.filterGroup}>
            <label>Ordenar por:</label>
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                <option value="desc">Mais recentes</option>
                <option value="data_asc">Mais antigas</option>
            </select>
        </div>
      </div>

      {/* --- TABELA DE CONSULTAS --- */}
      <div className={styles.tableContainer}>
        <table className={styles.consultasTable}>
          <thead>
            <tr>
              <th>Data / Hora</th>
              <th>Animal</th>
              <th>Tutor</th>
              <th>Veterinário</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td colSpan="5" className={styles.loadingState}>Carregando...</td></tr>)}
            {error && (<tr><td colSpan="5" className={styles.errorState}>{error}</td></tr>)}
            {!loading && !error && consultas.length === 0 && (<tr><td colSpan="5" className={styles.noData}>Nenhuma consulta encontrada.</td></tr>)}
            {!loading && !error && consultas.map((c) => (
              <tr key={c.id_consulta}>
                <td>{formatDate(c.data)}</td>
                <td>{c.animal?.nome || "N/A"}</td>
                <td>{c.animal?.tutor?.nome || "N/A"}</td>
                <td>{c.veterinario?.nome || "N/A"}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button onClick={() => handleOpenDetailModal(c.id_consulta)} title="Visualizar consulta">
                      <FaEye />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- CONTROLES DE PAGINAÇÃO --- */}
      {totalPages > 0 && (
        <div className={styles.paginationControls}>
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Anterior</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</button>
        </div>
      )}
    </div>
  );
}

export default Consultas;