import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import styles from "./Consultas.module.css";
import ConsultaDetailModal from "./ConsultaDetailModal";
import ConsultaModal from "./ConsultaModal";
import SelecaoAnimalModal from "./SelecaoAnimalModal";
import NovaConsultaModal from "./NovaConsultaModal";

function Consultas() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSelecaoOpen, setIsSelecaoOpen] = useState(false);
  const [isNovaConsultaOpen, setIsNovaConsultaOpen] = useState(false);
  const [animalIdParaConsulta, setAnimalIdParaConsulta] = useState(null);

  // Estados para filtros
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [ordenacao, setOrdenacao] = useState("desc");

  // Modais de detalhe e edição
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState(null);

  // ✅ 1. Estados para controle da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // ✅ 2. Função de busca agora é um useCallback e aceita a página
  const fetchConsultas = useCallback(async (page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        limit: 10, // Definindo um limite padrão
        ordenacao,
      });
      if (busca) params.append("busca", busca);
      if (dataInicio) params.append("dataInicio", dataInicio);
      if (dataFim) params.append("dataFim", dataFim);

      const response = await api.get(`/consultas?${params.toString()}`);
      
      setConsultas(response.data || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.currentPage || 1);
    } catch (err) {
      setError("Não foi possível carregar as consultas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [busca, dataInicio, dataFim, ordenacao]); // Dependências da função

  // ✅ 3. useEffect agora depende da página atual e da função de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConsultas(currentPage);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, fetchConsultas]);

  const handleDelete = async (idConsulta) => {
    if (window.confirm("Tem certeza que deseja excluir esta consulta?")) {
      try {
        await api.delete(`/consultas/${idConsulta}`);
        fetchConsultas(currentPage); // Recarrega a página atual
      } catch (err) {
        setError("Erro ao excluir consulta.");
        console.error(err);
      }
    }
  };

  const handleOpenEditModal = (consulta) => {
    setEditingConsulta(consulta);
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    setIsEditModalOpen(false);
    setEditingConsulta(null);
    fetchConsultas(currentPage);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(dateString));
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

  const handleAnimalSelecionado = (animalId) => {
    setAnimalIdParaConsulta(animalId);
    setIsSelecaoOpen(false);
    setIsNovaConsultaOpen(true);
  };

  const handleCloseNovaConsulta = () => {
    setIsNovaConsultaOpen(false);
    setAnimalIdParaConsulta(null);
    fetchConsultas(1); // Volta para a primeira página após nova consulta
  };

  return (
    <div className={styles.consultasContainer}>
      {/* --- MODAIS --- */}
      <ConsultaDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} consulta={selectedConsulta} />
      <ConsultaModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSave} consultaToEdit={editingConsulta} />
      <SelecaoAnimalModal isOpen={isSelecaoOpen} onClose={() => setIsSelecaoOpen(false)} onAnimalSelecionado={handleAnimalSelecionado} />
      <NovaConsultaModal isOpen={isNovaConsultaOpen} onClose={handleCloseNovaConsulta} onSave={handleCloseNovaConsulta} animalId={animalIdParaConsulta} />

      {/* --- CONTEÚDO DA PÁGINA --- */}
      <div className={styles.header}>
        <h1>Consultas</h1>
        <button className={styles.newButton} onClick={() => setIsSelecaoOpen(true)}>+ Nova Consulta</button>
      </div>

      <div className={styles.actionsBar}>
        <div className={styles.searchInputContainer}>
          <input type="text" placeholder="Buscar por nome do animal, tutor(a) ou CPF do Tutor(a)" className={styles.searchInput} value={busca} onChange={(e) => setBusca(e.target.value)} />
          <i className={`fas fa-search ${styles.searchIcon}`}></i>
        </div>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <label>Início</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div className={styles.filterGroup}>
          <label>Término</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
        <div className={styles.filterGroup}>
          <label>Ordenar por</label>
          <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
            <option value="desc">Mais recentes</option>
            <option value="asc">Mais antigas</option>
          </select>
        </div>
      </div>

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
            {loading && (<tr><td colSpan="5">Carregando...</td></tr>)}
            {error && (<tr><td colSpan="5" style={{ color: "red" }}>{error}</td></tr>)}
            {!loading && !error && consultas.map((c) => (
              <tr key={c.id_consulta}>
                <td>{formatDate(c.data)}</td>
                <td>{c.animal?.nome || "N/A"}</td>
                <td>{c.animal?.tutor?.nome || "N/A"}</td>
                <td>{c.veterinario?.nome || "N/A"}</td>
                <td className={styles.actionButtons}>
                  <button onClick={() => handleOpenDetailModal(c.id_consulta)} title="Ver Detalhes"><i className="fas fa-eye"></i></button>
                  <button onClick={() => handleOpenEditModal(c)} title="Editar"><i className="fas fa-pencil-alt"></i></button>
                  <button onClick={() => handleDelete(c.id_consulta)} title="Excluir"><i className="fas fa-trash-alt"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ 4. Controles de Paginação */}
      <div className={styles.paginationControls}>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || totalPages === 0}>Anterior</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>Próxima</button>
      </div>
    </div>
  );
}

export default Consultas;