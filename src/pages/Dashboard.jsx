// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({});
  const [appointments, setAppointments] = useState([]);

  // --- NOVOS ESTADOS PARA O FILTRO ---
  const [veterinarios, setVeterinarios] = useState([]);
  const [filtroVetId, setFiltroVetId] = useState(""); // '' para o padrão, 'todos' ou um ID
  const [userType, setUserType] = useState("");

  // Efeito para buscar a lista de veterinários (apenas para admins/padrão)
  useEffect(() => {
    const tipo = localStorage.getItem("user_type");
    setUserType(tipo);

    if (tipo === "admin" || tipo === "padrao") {
      api
        .getVeterinarios("?limit=1000")
        .then((res) => setVeterinarios(res.data || []))
        .catch(() =>
          setError("Não foi possível carregar a lista de veterinários.")
        );
    }
  }, []);

  // Efeito para buscar os dados do dashboard quando o filtro muda
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Monta os parâmetros: se filtroVetId tiver um valor, ele é enviado
        const params = new URLSearchParams();
        if (filtroVetId) {
          params.append("id_vet_filtro", filtroVetId);
        }

        const data = await api.getDashboardData(params.toString());

        setSummary(data.resumoDiario);
        setAppointments(data.proximasConsultas);
      } catch (err) {
        setError("Não foi possível carregar os dados do dashboard.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filtroVetId]); // ✅ Roda o efeito sempre que o filtroVetId mudar

  const getCurrentDate = () => {
    const today = new Date();
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(today);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    }).format(date);
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.pageHeader}>
        <h1>Início</h1>
        {/* ✅ FILTRO DE VETERINÁRIOS (SÓ APARECE PARA ADMIN/PADRÃO) */}
        {(userType === "admin" || userType === "padrao") && (
          <div className={styles.filterContainer}>
            <label htmlFor="vet-filter">Visualizar agenda de:</label>
            <select
              id="vet-filter"
              value={filtroVetId}
              onChange={(e) => setFiltroVetId(e.target.value)}
            >
              <option value="todos">Todos os Veterinários</option>
              {veterinarios.map((vet) => (
                <option key={vet.id_veterinario} value={vet.id_veterinario}>
                  Dr(a). {vet.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={styles.dateHeader}>
        <i className="fas fa-calendar-alt"></i>
        <span>{getCurrentDate()}</span>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <>
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
                      Nenhuma consulta agendada para a seleção atual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
