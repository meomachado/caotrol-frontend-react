// pages/Animais/AnimalDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./AnimalDetailPage.module.css";

function AnimalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados para os dados
  const [animal, setAnimal] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [prescricoes, setPrescricoes] = useState([]);
  const [exames, setExames] = useState([]);
  const [vacinas, setVacinas] = useState([]);

  // Estados de UI
  const [activeTab, setActiveTab] = useState("consultas"); // Aba inicial
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllAnimalData = async () => {
      try {
        setLoading(true);
        setError("");

        // Busca todos os dados em paralelo para otimizar o carregamento
        const [animalRes, consultasRes, prescricoesRes, examesRes, vacinasRes] =
          await Promise.all([
            api.getAnimalById(id),
            api.getConsultasByAnimal(id),
            api.getPrescricoesByAnimal(id),
            api.getExamesByAnimal(id),
            api.getVacinasByAnimal(id),
          ]);

        setAnimal(animalRes);
        setConsultas(consultasRes || []);
        setPrescricoes(prescricoesRes || []);
        setExames(examesRes || []);
        setVacinas(vacinasRes || []);
      } catch (err) {
        setError("Não foi possível carregar o prontuário completo do animal.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAnimalData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const options = {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return new Intl.DateTimeFormat("pt-BR", options).format(
      new Date(dateString)
    );
  };

  // Componente para renderizar o conteúdo de cada aba
  const TabContent = () => {
    switch (activeTab) {
      case "consultas":
        return (
          <div className={styles.historyList}>
            {consultas.length > 0 ? (
              consultas.map((c) => (
                <div key={c.id_consulta} className={styles.historyItem}>
                  <div className={styles.historyDate}>{formatDate(c.data)}</div>
                  <div className={styles.historyDetails}>
                    <h4>Dr(a). {c.veterinario?.nome || "N/A"}</h4>
                    <p>
                      <strong>Queixa Principal:</strong>{" "}
                      {c.queixa || "Não registrada."}
                    </p>
                    <p>
                      <strong>Diagnóstico:</strong>{" "}
                      {c.diagnostico || "Não registrado."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhuma consulta registrada.</p>
            )}
          </div>
        );

      case "prescricoes":
        return (
          <div className={styles.historyList}>
            {prescricoes.length > 0 ? (
              prescricoes.map((p) => (
                <div key={p.id_prescricao} className={styles.historyItem}>
                  <div className={styles.historyDate}>
                    {formatDate(p.consulta.data)}
                  </div>
                  <div className={styles.historyDetails}>
                    <h4>Dr(a). {p.consulta.veterinario?.nome || "N/A"}</h4>
                    <p>
                      <strong>Descrição:</strong>{" "}
                      {p.descricao || "Não registrada."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhuma prescrição encontrada.</p>
            )}
          </div>
        );

      case "exames":
        return (
          <div className={styles.historyList}>
            {exames.length > 0 ? (
              exames.map((e) => (
                <div key={e.id_exame} className={styles.historyItem}>
                  <div className={styles.historyDate}>
                    {formatDate(e.consulta.data)}
                  </div>
                  <div className={styles.historyDetails}>
                    <h4>Dr(a). {e.consulta.veterinario?.nome || "N/A"}</h4>
                    <p>
                      <strong>Solicitação:</strong>{" "}
                      {e.solicitacao || "Não registrada."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhum exame encontrado.</p>
            )}
          </div>
        );

      case "vacinas":
        return (
          <div className={styles.historyList}>
            {vacinas.length > 0 ? (
              vacinas.map((v) => (
                <div key={v.id_vacina} className={styles.historyItem}>
                  <div className={styles.historyDate}>
                    {formatDate(v.data_aplic)}
                  </div>
                  <div className={styles.historyDetails}>
                    <h4>{v.nome}</h4>
                    <p>
                      <strong>Próxima Dose:</strong>{" "}
                      {v.data_prox ? formatDate(v.data_prox) : "Não agendada"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhuma vacina registrada.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading)
    return <div className={styles.statusMessage}>Carregando prontuário...</div>;
  if (error)
    return (
      <div className={`${styles.statusMessage} ${styles.error}`}>{error}</div>
    );
  if (!animal)
    return <div className={styles.statusMessage}>Animal não encontrado.</div>;

  return (
    <div className={styles.detailPage}>
      <div className={styles.header}>
        <h1>Prontuário de {animal.nome}</h1>
        <button
          onClick={() => navigate("/animais")}
          className={styles.backButton}
        >
          <i className="fas fa-arrow-left"></i> Voltar para Lista
        </button>
      </div>

      {/* Card com os dados fixos do animal */}
      <div className={styles.card}>
        <div className={styles.detailGrid}>
          <div>
            <label>Tutor</label>
            <p>{animal.tutor?.nome || "—"}</p>
          </div>
          <div>
            <label>Espécie</label>
            <p>{animal.raca?.especie?.nome || "—"}</p>
          </div>
          <div>
            <label>Raça</label>
            <p>{animal.raca?.nome || "—"}</p>
          </div>
          <div>
            <label>Sexo</label>
            <p>{animal.sexo === "M" ? "Macho" : "Fêmea"}</p>
          </div>
          <div>
            <label>Nascimento</label>
            <p>{formatDate(animal.data_nasc)}</p>
          </div>
          <div>
            <label>Porte</label>
            <p>{animal.porte || "—"}</p>
          </div>
        </div>
      </div>

      {/* Card com as abas de navegação */}
      <div className={styles.card}>
        <nav className={styles.tabNav}>
          <button
            onClick={() => setActiveTab("consultas")}
            className={activeTab === "consultas" ? styles.active : ""}
          >
            Consultas
          </button>
          <button
            onClick={() => setActiveTab("prescricoes")}
            className={activeTab === "prescricoes" ? styles.active : ""}
          >
            Prescrições
          </button>
          <button
            onClick={() => setActiveTab("exames")}
            className={activeTab === "exames" ? styles.active : ""}
          >
            Exames
          </button>
          <button
            onClick={() => setActiveTab("vacinas")}
            className={activeTab === "vacinas" ? styles.active : ""}
          >
            Vacinas
          </button>
        </nav>

        <div className={styles.tabContent}>
          <TabContent />
        </div>
      </div>
    </div>
  );
}

export default AnimalDetailPage;
