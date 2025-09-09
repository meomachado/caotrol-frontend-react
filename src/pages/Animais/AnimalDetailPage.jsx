// pages/Animais/AnimalDetailPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./AnimalDetailPage.module.css";
import ResultadoExameModal from "./ResultadoExameModal";

function AnimalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [prescricoes, setPrescricoes] = useState([]);
  const [exames, setExames] = useState([]);
  const [vacinas, setVacinas] = useState([]);
  const [activeTab, setActiveTab] = useState("consultas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExameModalOpen, setIsExameModalOpen] = useState(false);
  const [selectedExame, setSelectedExame] = useState(null);

  const fetchAllAnimalData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
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
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAllAnimalData();
  }, [fetchAllAnimalData]);

  const handleOpenExameModal = (exame) => {
    setSelectedExame(exame);
    setIsExameModalOpen(true);
  };
  const handleSaveExame = () => {
    setIsExameModalOpen(false);
    setSelectedExame(null);
    fetchAllAnimalData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(dateString));
  };
  
  const calculateAge = (dateString) => {
    if (!dateString) return "—";
    const ageInMilliseconds = new Date() - new Date(dateString);
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    const years = Math.floor(ageInYears);
    const months = Math.floor((ageInYears - years) * 12);
    if (years > 0) return `${years} ano(s)${months > 0 ? ` e ${months} mes(es)` : ''}`;
    return `${months} mes(es)`;
  };

  if (loading) return <div className={styles.statusMessage}>Carregando prontuário...</div>;
  if (error) return <div className={`${styles.statusMessage} ${styles.error}`}>{error}</div>;
  if (!animal) return <div className={styles.statusMessage}>Animal não encontrado.</div>;

  return (
    <div className={styles.detailPage}>
      <ResultadoExameModal isOpen={isExameModalOpen} onClose={() => setIsExameModalOpen(false)} onSave={handleSaveExame} exame={selectedExame} />
      
      <div className={styles.header}>
        <h1>Prontuário de <strong>{animal.nome}</strong></h1>
        <button onClick={() => navigate("/animais")} className={styles.backButton}>
          <i className="fas fa-arrow-left"></i> Voltar
        </button>
      </div>

      <div className={styles.layout}>
        {/* PAINEL ESQUERDO COM DETALHES FIXOS */}
        <div className={styles.leftPanel}>
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Ficha do Animal</h3>
                <div className={styles.detailGroup}><label>Tutor</label><p><i className="fas fa-user"></i>{animal.tutor?.nome || "—"}</p></div>
                <div className={styles.detailGroup}><label>Espécie</label><p><i className="fas fa-paw"></i>{animal.raca?.especie?.nome || "—"}</p></div>
                <div className={styles.detailGroup}><label>Raça</label><p><i className="fas fa-dog"></i>{animal.raca?.nome || "—"}</p></div>
                <div className={styles.detailGroup}><label>Sexo</label><p><i className="fas fa-venus-mars"></i>{animal.sexo === "M" ? "Macho" : "Fêmea"}</p></div>
                <div className={styles.detailGroup}><label>Idade</label><p><i className="fas fa-birthday-cake"></i>{calculateAge(animal.data_nasc)}</p></div>
                <div className={styles.detailGroup}><label>Nascimento</label><p><i className="fas fa-calendar-alt"></i>{formatDate(animal.data_nasc)}</p></div>
                <div className={styles.detailGroup}><label>Porte</label><p><i className="fas fa-ruler-combined"></i>{animal.porte || "—"}</p></div>
            </div>
        </div>

        {/* PAINEL DIREITO COM HISTÓRICO EM ABAS */}
        <div className={styles.rightPanel}>
            <div className={styles.card}>
                <nav className={styles.tabNav}>
                    <button onClick={() => setActiveTab("consultas")} className={activeTab === "consultas" ? styles.active : ""}> <i className="fas fa-notes-medical"></i> Consultas </button>
                    <button onClick={() => setActiveTab("prescricoes")} className={activeTab === "prescricoes" ? styles.active : ""}> <i className="fas fa-file-prescription"></i> Prescrições </button>
                    <button onClick={() => setActiveTab("exames")} className={activeTab === "exames" ? styles.active : ""}> <i className="fas fa-vial"></i> Exames </button>
                    <button onClick={() => setActiveTab("vacinas")} className={activeTab === "vacinas" ? styles.active : ""}> <i className="fas fa-syringe"></i> Vacinas </button>
                </nav>
                <div className={styles.tabContent}>
                  {activeTab === "consultas" && (
                    <div className={styles.historyList}>
                      {consultas.length > 0 ? (consultas.map((c) => (
                        <div key={c.id_consulta} className={styles.historyCard}>
                          <div className={styles.historyHeader}><span>{formatDate(c.data)}</span><span>Dr(a). {c.veterinario?.nome || "N/A"}</span></div>
                          <div className={styles.historyContent}>
                            <p><strong>Queixa:</strong> {c.queixa || "Não registrada."}</p>
                            <p><strong>Diagnóstico:</strong> {c.diagnostico || "Não registrado."}</p>
                          </div>
                        </div>
                      ))) : (<div className={styles.noData}><i className="fas fa-box-open"></i><p>Nenhuma consulta registrada.</p></div>)}
                    </div>
                  )}
                  {activeTab === "prescricoes" && (
                    <div className={styles.historyList}>
                      {prescricoes.length > 0 ? (prescricoes.map((p) => (
                        <div key={p.id_prescricao} className={styles.historyCard}>
                           <div className={styles.historyHeader}><span>{formatDate(p.consulta.data)}</span><span>Dr(a). {p.consulta.veterinario?.nome || "N/A"}</span></div>
                           <div className={styles.historyContent}><p>{p.descricao || "Não registrada."}</p></div>
                        </div>
                      ))) : (<div className={styles.noData}><i className="fas fa-box-open"></i><p>Nenhuma prescrição encontrada.</p></div>)}
                    </div>
                  )}
                  {activeTab === "exames" && (
                     <div className={styles.historyList}>
                        {exames.length > 0 ? (exames.map((e) => (
                            <div key={e.id_exame} className={styles.historyCard}>
                                <div className={styles.historyHeader}><span>{formatDate(e.consulta.data)}</span><span>Dr(a). {e.consulta.veterinario?.nome || "N/A"}</span></div>
                                <div className={styles.historyContent}>
                                    <p><strong>Solicitação:</strong> {e.solicitacao || "Não registrada."}</p>
                                    {e.resultado && (<p className={styles.resultadoText}><strong>Resultado:</strong> {e.resultado}</p>)}
                                </div>
                                <button className={styles.addResultButton} onClick={() => handleOpenExameModal(e)}>
                                    <i className="fas fa-plus"></i> {e.resultado ? 'Editar' : 'Adicionar Resultado'}
                                </button>
                            </div>
                        ))) : (<div className={styles.noData}><i className="fas fa-box-open"></i><p>Nenhum exame encontrado.</p></div>)}
                     </div>
                  )}
                  {activeTab === "vacinas" && (
                    <div className={styles.historyList}>
                        {vacinas.length > 0 ? (vacinas.map((v) => (
                            <div key={v.id_vacina} className={styles.historyCard}>
                                <div className={styles.historyHeader}><span>{formatDate(v.data_aplic)}</span><h4>{v.nome}</h4></div>
                                <div className={styles.historyContent}><p><strong>Próxima Dose:</strong> {v.data_prox ? formatDate(v.data_prox) : "Não agendada"}</p></div>
                            </div>
                        ))) : (<div className={styles.noData}><i className="fas fa-box-open"></i><p>Nenhuma vacina registrada.</p></div>)}
                    </div>
                  )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default AnimalDetailPage;