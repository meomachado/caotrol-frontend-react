// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});
  const [appointments, setAppointments] = useState([]);

  // Função para buscar os dados do dashboard no backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // A API retorna um objeto com 'resumoDiario' e 'proximasConsultas'
      // O endpoint `/dashboard` já está configurado para retornar esses dados
      const { resumoDiario, proximasConsultas } = await api.get("/dashboard");

      setSummary(resumoDiario);
      setAppointments(proximasConsultas);
    } catch (err) {
      setError("Não foi possível carregar os dados do dashboard.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Executa a busca assim que o componente for montado
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Função para pegar a data atual formatada
  const getCurrentDate = () => {
    const today = new Date();
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(today);
  };

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString); // Explicitamente converte a data para o fuso horário do usuário
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    }).format(date);
  };

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.pageHeader}>
        <i className="fas fa-calendar-alt"></i>
        <span>{getCurrentDate()}</span>
      </div>

      <h2 className={styles.sectionTitle}>Resumo Diário</h2>
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <h3>Agendamentos</h3>
          <p>{summary.agendados}</p>
        </div>
        <div className={styles.summaryCard}>
          <h3>Confirmados</h3>
          <p>{summary.confirmados}</p>
        </div>
        <div className={styles.summaryCard}>
          <h3>Atendidos</h3>
          <p>{summary.atendidos}</p>
        </div>
        <div className={styles.summaryCard}>
          <h3>Faltas</h3>
          <p>{summary.faltas}</p>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Próximas Consultas do Dia</h2>
      <div className={styles.tableContainer}>
        <table className={styles.appointmentsTable}>
          <thead>
            <tr>
              <th>Horário</th>
              <th>Animal</th>
              <th>Tutor</th>
              <th>Veterinário</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((a) => (
                <tr key={a.id_agenda}>
                  <td>{formatTime(a.data_exec)}</td>
                  <td>{a.animal?.nome || "N/A"}</td>
                  <td>{a.tutor?.nome || "N/A"}</td>
                  <td>{a.veterinario?.nome || "N/A"}</td>
                  <td>
                    <span className={styles.statusChip}>{a.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  Nenhuma consulta agendada para o dia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
