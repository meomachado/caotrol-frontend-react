// src/pages/Consultas/Consultas.jsx

import React, { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./Consultas.module.css";
import ConsultaDetailModal from "./ConsultaDetailModal";
// import ConsultaModal from './ConsultaModal';

function Consultas() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [ordenacao, setOrdenacao] = useState("desc");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState(null);

  const fetchConsultas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: 1,
        limit: 20,
        ordenacao,
      });
      if (busca) params.append("busca", busca);
      if (dataInicio) params.append("dataInicio", dataInicio);
      if (dataFim) params.append("dataFim", dataFim);

      const response = await api.get(`/consultas?${params.toString()}`);
      setConsultas(response.data || []);
    } catch (err) {
      setError("Não foi possível carregar as consultas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConsultas();
    }, 500);
    return () => clearTimeout(timer);
  }, [busca, dataInicio, dataFim, ordenacao]);

  const handleDelete = async (idConsulta) => {
    if (window.confirm("Tem certeza que deseja excluir esta consulta?")) {
      try {
        await api.delete(`/consultas/${idConsulta}`); // Supondo que a rota de delete exista
        fetchConsultas(); // Recarrega a lista
      } catch (err) {
        setError("Erro ao excluir consulta.");
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const handleOpenDetailModal = async (idConsulta) => {
    try {
      // Busca os dados completos da consulta, incluindo prescrição, etc.
      const response = await api.get(`/consultas/${idConsulta}`);
      setSelectedConsulta(response); // O seu 'api.js' já retorna o dado
      setIsDetailModalOpen(true);
    } catch (err) {
      setError("Erro ao carregar detalhes da consulta.");
      console.error(err);
    }
  };
  return (
    <div className={styles.consultasContainer}>
      <ConsultaDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        consulta={selectedConsulta}
      />

      <div className={styles.header}>
        <h1>Consultas</h1>
        <button className={styles.newButton}>+ Nova Consulta</button>
      </div>

      <div className={styles.actionsBar}>
        <div className={styles.searchInputContainer}>
          <input
            type="text"
            placeholder="Buscar por nome do animal, tutor(a) ou CPF do Tutor(a)"
            className={styles.searchInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <i className={`fas fa-search ${styles.searchIcon}`}></i>
        </div>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <label>Início</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>Término</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>Ordenar por</label>
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
          >
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
            {loading && (
              <tr>
                <td colSpan="6">Carregando...</td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="6" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              consultas.map((c) => (
                <tr key={c.id_consulta}>
                  <td>{formatDate(c.data)}</td>
                  <td>{c.animal?.nome || "N/A"}</td>
                  <td>{c.animal?.tutor?.nome || "N/A"}</td>
                  <td>{c.veterinario?.nome || "N/A"}</td>
                  <td className={styles.actionButtons}>
                    <button
                      onClick={() => handleOpenDetailModal(c.id_consulta)}
                      title="Ver Detalhes"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button title="Editar">
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(c.id_consulta)}
                      title="Excluir"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Consultas;
