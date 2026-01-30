import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./AnimalDetailPage.module.css";
import ResultadoExameModal from "./ResultadoExameModal";
import VacinaModal from "../Vacinas/VacinaModal";
import AnimalModal from "./AnimalModal";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// --- IMPORTAÇÃO DO PDF GENERATOR ---
import PdfGeneratorModal from "../Documentos/PdfGeneratorModal";

// --- IMPORTAÇÕES CORRIGIDAS (Pasta 'Consulta' no singular) ---
import ConsultaDetailModal from "../Consulta/ConsultaDetailModal";
import NovaConsultaModal from "../Consulta/NovaConsultaModal"; 
// -------------------------------------------------------------

import {
  FaPlus,
  FaPencilAlt,
  FaTrashAlt,
  FaArrowLeft,
  FaSyringe,
  FaNotesMedical,
  FaFilePrescription,
  FaVial,
  FaUser,
  FaQuestionCircle,
  FaPrint,
  FaEye,
  FaStethoscope, // Ícone para o botão de nova consulta
  FaCheck,
  FaFlask
} from "react-icons/fa";
import {
  FaPaw,
  FaDog,
  FaVenusMars,
  FaBirthdayCake,
  FaCalendarAlt,
  FaRulerCombined,
  FaBoxOpen,
} from "react-icons/fa";

import HelpModal from "../Help/HelpModal";
import helpButtonStyles from "../Help/HelpButton.module.css";

const MySwal = withReactContent(Swal);

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
  const [isVacinaModalOpen, setIsVacinaModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // --- ESTADO PARA NOVA CONSULTA ---
  const [isNovaConsultaOpen, setIsNovaConsultaOpen] = useState(false);

  const [currentVet, setCurrentVet] = useState(null);

  // ESTADO UNIFICADO PARA EDIÇÃO DE PDF (Prescrição ou Exame)
  const [pdfEditModalState, setPdfEditModalState] = useState({
    isOpen: false,
    type: null, // 'prescricao' ou 'exame'
    itemId: null,
    currentText: "",
    consultaInfo: null 
  });

  const [isConsultaDetailOpen, setIsConsultaDetailOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState(null);

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpContent, setHelpContent] = useState(null);
  const [helpLoading, setHelpLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentVet = async () => {
      const vetId = localStorage.getItem("vet_id");
      if (vetId) {
        try {
          const vetData = await api.getVeterinarioById(vetId);
          setCurrentVet(vetData);
        } catch (error) {
          console.error("Erro ao carregar veterinário logado:", error);
        }
      }
    };
    fetchCurrentVet();
  }, []);

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
      
      const sortedVacinas = (vacinasRes || []).sort((a, b) => {
        const dateA = new Date(a.data_aplic);
        const dateB = new Date(b.data_aplic);
        if (dateB - dateA !== 0) {
          return dateB - dateA;
        }
        return b.id_vacina - a.id_vacina;
      });
      setVacinas(sortedVacinas);
    } catch (err) {
      setError("Não foi possível carregar o prontuário completo do animal.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAllAnimalData();
  }, [fetchAllAnimalData]);

  const handleOpenHelp = async () => {
    setHelpLoading(true);
    try {
      const data = await api.getHelpContent('prontuario-animal'); 
      setHelpContent(data);
      setIsHelpModalOpen(true);
    } catch (err) {
      console.error("Erro ao buscar ajuda:", err);
      toast.error(err.message || "Não foi possível carregar o tópico de ajuda.");
    } finally {
      setHelpLoading(false);
    }
  };

  const handleDelete = async () => {
      MySwal.fire({
       title: 'Tem certeza?',
       text: "Deseja mesmo excluir este animal? Esta ação não pode ser desfeita.",
       icon: 'warning',
       showCancelButton: true,
       confirmButtonColor: '#d33',
       cancelButtonColor: '#6c757d',
       confirmButtonText: 'Sim, excluir!',
       cancelButtonText: 'Cancelar'
      }).then(async (result) => {
       if (result.isConfirmed) {
        try {
         await api.delete(`/animais/${id}`);
         toast.success("Animal excluído com sucesso!");
         navigate("/animais");
        } catch (err) {
         toast.error(err.message || "Ocorreu um erro ao excluir o animal.");
        }
       }
      });
  };

  const handleOpenConsultaDetail = async (idConsulta) => {
    try {
      const data = await api.getConsultaById(idConsulta);
      setSelectedConsulta(data);
      setIsConsultaDetailOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar detalhes da consulta.");
    }
  };

  // --- RESULTADO DE EXAME ---
  const handleOpenExameModal = (exame) => {
    setSelectedExame(exame);
    setIsExameModalOpen(true);
  };

  const handleSaveExame = () => {
    setIsExameModalOpen(false);
    setSelectedExame(null);
    fetchAllAnimalData();
  };

  const handleSaveVacina = () => {
    setIsVacinaModalOpen(false);
    fetchAllAnimalData();
  };

  const handleSaveAnimal = () => {
    setIsEditModalOpen(false);
    fetchAllAnimalData();
  };

  const handleSaveNovaConsulta = () => {
    setIsNovaConsultaOpen(false);
    fetchAllAnimalData();
  };

  // --- EDIÇÃO DE PRESCRIÇÃO E EXAMES (REQUISIÇÃO) ---
  const handleEditPrescricao = (prescricao) => {
    setPdfEditModalState({
      isOpen: true,
      type: 'prescricao',
      itemId: prescricao.id_prescricao,
      currentText: prescricao.descricao,
      consultaInfo: prescricao.consulta 
    });
  };

  const handleEditExamRequest = (exame) => {
    setPdfEditModalState({
      isOpen: true,
      type: 'exame',
      itemId: exame.id_exame,
      currentText: exame.solicitacao,
      consultaInfo: exame.consulta
    });
  };

  const handleSaveEditedPdf = async (newText) => {
    const { type, itemId, consultaInfo } = pdfEditModalState;

    try {
      const payloadPdf = {
        nome_tutor: animal?.tutor?.nome ?? "Não informado",
        nome_animal: animal?.nome ?? "Não informado",
        especie: animal?.raca?.especie?.nome ?? "N/A",
        raca: animal?.raca?.nome ?? "N/A",
        idade: calculateAge(animal?.data_nasc),
        peso: "N/A", 
        nome_veterinario: currentVet?.nome ?? "Não informado",
        crmv_veterinario: currentVet?.crmv ?? "N/A", 
        data_consulta: consultaInfo?.data,
      };

      if (type === 'prescricao') {
        await api.patch(`/prescricoes/${itemId}`, { descricao: newText });
        toast.success("Prescrição atualizada!");
        
        payloadPdf.descricoes_prescricao = newText.split("\n").filter(line => line.trim() !== "");
        const pdfBlob = await api.gerarPrescricaoPreview(payloadPdf);
        const fileURL = URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));
        window.open(fileURL, "_blank");

      } else if (type === 'exame') {
        // Atualiza a solicitação do exame
        await api.patch(`/exames/${itemId}`, { solicitacao: newText });
        toast.success("Solicitação de exame atualizada!");

        payloadPdf.solicitacoes_exame = newText.split("\n").filter(line => line.trim() !== "");
        const pdfBlob = await api.gerarExamePreview(payloadPdf);
        const fileURL = URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));
        window.open(fileURL, "_blank");
      }

      setPdfEditModalState({ isOpen: false, type: null, itemId: null, currentText: "", consultaInfo: null });
      fetchAllAnimalData();

    } catch (err) {
      console.error(`Erro ao atualizar ${type}:`, err);
      toast.error("Erro ao atualizar e gerar PDF.");
    }
  };

  // --- IMPRESSÃO DIRETA DE EXAME ---
  const handlePrintExam = async (exame) => {
    try {
        const payloadPdf = {
            nome_tutor: animal?.tutor?.nome ?? "N/A",
            nome_animal: animal?.nome ?? "N/A",
            especie: animal?.raca?.especie?.nome ?? "N/A",
            raca: animal?.raca?.nome ?? "N/A",
            idade: calculateAge(animal?.data_nasc),
            peso: "N/A", 
            nome_veterinario: currentVet?.nome ?? "N/A",
            crmv_veterinario: currentVet?.crmv ?? "N/A", 
            data_consulta: exame.consulta?.data,
            solicitacoes_exame: exame.solicitacao.split("\n").filter(line => line.trim() !== "")
        };
        const pdfBlob = await api.gerarExamePreview(payloadPdf);
        const fileURL = URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));
        window.open(fileURL, "_blank");
    } catch (error) {
        toast.error("Erro ao imprimir.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
      new Date(dateString)
    );
  };

  const calculateAge = (dateString) => {
    if (!dateString) return "—";
    const ageInMilliseconds = new Date() - new Date(dateString);
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    const years = Math.floor(ageInYears);
    const months = Math.floor((ageInYears - years) * 12);
    if (years > 0)
      return `${years} ano(s)${months > 0 ? ` e ${months} mes(es)` : ""}`;
    return `${months} mes(es)`;
  };

  const capitalize = (text) => {
    if (!text) return "—";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // --- HELPER: Agrupar Exames por Data ---
  const groupExamsByConsulta = (examsList) => {
    const groups = {};
    examsList.forEach(exame => {
        const consultaId = exame.consulta.id_consulta;
        const dateKey = exame.consulta.data;
        // Chave única composta por ID para garantir unicidade, mas usaremos a data para exibir
        const key = `${consultaId}`; 
        
        if (!groups[key]) {
            groups[key] = {
                date: dateKey,
                vet: exame.consulta.veterinario?.nome || "N/A",
                exams: []
            };
        }
        groups[key].exams.push(exame);
    });
    
    // Ordenar por data decrescente
    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
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
    <>
      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        content={helpContent}
      />

      <div className={styles.detailPage}>
        <AnimalModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveAnimal}
          animalToEdit={animal}
        />

        <VacinaModal
          isOpen={isVacinaModalOpen}
          onClose={() => setIsVacinaModalOpen(false)}
          onSave={handleSaveVacina}
          animalId={id}
        />

        <ResultadoExameModal
          isOpen={isExameModalOpen}
          onClose={() => setIsExameModalOpen(false)}
          onSave={handleSaveExame}
          exame={selectedExame}
        />

        {/* MODAL DE EDIÇÃO GENÉRICO (PARA EXAMES E PRESCRIÇÕES) */}
        <PdfGeneratorModal
            isOpen={pdfEditModalState.isOpen}
            onClose={() => setPdfEditModalState({ ...pdfEditModalState, isOpen: false })}
            onGeneratePdf={handleSaveEditedPdf} 
            title={pdfEditModalState.type === 'prescricao' ? "Editar Prescrição" : "Editar Solicitação"}
            label={pdfEditModalState.type === 'prescricao' ? "Itens da Prescrição" : "Exames Solicitados"}
            initialText={pdfEditModalState.currentText}
            confirmButtonText="Salvar e Gerar PDF"
        />

        <ConsultaDetailModal 
          isOpen={isConsultaDetailOpen}
          onClose={() => setIsConsultaDetailOpen(false)}
          consulta={selectedConsulta}
        />

        <NovaConsultaModal 
          isOpen={isNovaConsultaOpen}
          onClose={() => setIsNovaConsultaOpen(false)}
          onSave={handleSaveNovaConsulta}
          animalId={id} 
        />

        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h1>
              Prontuário de <strong>{animal.nome}</strong>
            </h1>
            <button 
              className={helpButtonStyles.helpIcon} 
              onClick={handleOpenHelp}
              disabled={helpLoading}
              title="Ajuda"
            >
              <FaQuestionCircle />
            </button>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={() => navigate("/animais")}
              className={styles.actionButtonNeutral}
            >
              <FaArrowLeft /> Voltar
            </button>

            <button onClick={handleDelete} className={styles.actionButtonDanger}>
              <FaTrashAlt /> Excluir
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className={styles.actionButtonPrimary}
            >
              <FaPencilAlt /> Editar
            </button>
            
            <button
              onClick={() => setIsNovaConsultaOpen(true)}
              className={styles.actionButtonPrimary}
              style={{ backgroundColor: '#2980b9', boxShadow: '0 2px 6px rgba(41, 128, 185, 0.3)' }} 
              title="Iniciar um novo atendimento para este animal"
            >
              <FaStethoscope /> Iniciar Consulta
            </button>
          </div>
        </div>

        <div className={styles.layout}>
           <div className={styles.leftPanel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Ficha do Animal</h3>
              <div className={styles.detailGroup}>
                <label>Tutor</label>
                <p><FaUser />{animal.tutor?.nome || "—"}</p>
              </div>
              <div className={styles.detailGroup}>
                <label>Espécie</label>
                <p><FaPaw />{animal.raca?.especie?.nome || "—"}</p>
              </div>
              <div className={styles.detailGroup}>
                <label>Raça</label>
                <p><FaDog />{animal.raca?.nome || "—"}</p>
              </div>
              <div className={styles.detailGroup}>
                <label>Sexo</label>
                <p><FaVenusMars />{animal.sexo === "M" ? "Macho" : "Fêmea"}</p>
              </div>
              <div className={styles.detailGroup}>
                <label>Idade</label>
                <p><FaBirthdayCake />{calculateAge(animal.data_nasc)}</p>
              </div>
              <div className={styles.detailGroup}>
                <label>Nascimento</label>
                <p><FaCalendarAlt />{formatDate(animal.data_nasc)}</p>
              </div>
              <div className={styles.detailGroup}>
                <label>Porte</label>
                <p><FaRulerCombined />{capitalize(animal.porte)}</p>
              </div>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.card}>
              <nav className={styles.tabNav}>
                <button onClick={() => setActiveTab("consultas")} className={activeTab === "consultas" ? styles.active : ""}>
                  <FaNotesMedical /> Consultas
                </button>
                <button onClick={() => setActiveTab("prescricoes")} className={activeTab === "prescricoes" ? styles.active : ""}>
                  <FaFilePrescription /> Prescrições
                </button>
                <button onClick={() => setActiveTab("exames")} className={activeTab === "exames" ? styles.active : ""}>
                  <FaVial /> Exames
                </button>
                <button onClick={() => setActiveTab("vacinas")} className={activeTab === "vacinas" ? styles.active : ""}>
                  <FaSyringe /> Vacinas
                </button>
              </nav>

              <div className={styles.tabContent}>
                
                {activeTab === "consultas" && (
                   <div className={styles.historyList}>
                   {consultas.length > 0 ? (
                     consultas.map((c) => (
                       <div key={c.id_consulta} className={styles.historyCard}>
                         <div className={styles.historyHeader}>
                           <span>{formatDate(c.data)}</span>
                           <span>Dr(a). {c.veterinario?.nome || "N/A"}</span>
                         </div>
                         <div className={styles.historyBody}>
                            <div className={styles.historyContent}>
                                <p><strong>Queixa:</strong> {c.queixa || "Não registrada."}</p>
                                <p><strong>Diagnóstico:</strong> {c.diagnostico || "Não registrado."}</p>
                            </div>
                            <button 
                                className={styles.actionButtonSecondary}
                                onClick={() => handleOpenConsultaDetail(c.id_consulta)}
                                title="Ver ficha completa da consulta"
                            >
                                <FaEye /> Detalhes
                            </button>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className={styles.noData}>
                       <FaBoxOpen />
                       <p>Nenhuma consulta registrada.</p>
                     </div>
                   )}
                 </div>
                )}

                {activeTab === "prescricoes" && (
                  <div className={styles.historyList}>
                    {prescricoes.length > 0 ? (
                      prescricoes.map((p) => (
                        <div key={p.id_prescricao} className={styles.historyCard}>
                          <div className={styles.historyHeader}>
                            <span>{formatDate(p.consulta.data)}</span>
                            <span>
                              Dr(a). {p.consulta.veterinario?.nome || "N/A"}
                            </span>
                          </div>
                          <div className={styles.historyBody}>
                            <div className={styles.historyContent}>
                                <p style={{whiteSpace: 'pre-wrap'}}>{p.descricao || "Não registrada."}</p>
                            </div>
                            <button
                                className={styles.actionButtonSecondary}
                                onClick={() => handleEditPrescricao(p)}
                                title="Editar texto e gerar PDF novamente"
                            >
                                <FaPencilAlt /> Editar
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.noData}>
                        <FaBoxOpen />
                        <p>Nenhuma prescrição encontrada.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* --- ABA DE EXAMES RENOVADA --- */}
                {activeTab === "exames" && (
                  <div className={styles.historyList}>
                    {exames.length > 0 ? (
                      groupExamsByConsulta(exames).map((group, groupIndex) => (
                        <div key={groupIndex} className={styles.examGroupCard}>
                            {/* Cabeçalho do Grupo (Data) */}
                            <div className={styles.examGroupHeader}>
                                <span>{formatDate(group.date)}</span>
                                <span style={{fontSize: '0.9em', fontWeight: 'normal'}}>
                                    <FaUser size={12} style={{marginRight: '5px'}}/>
                                    Dr(a). {group.vet}
                                </span>
                            </div>
                            
                            {/* Tabela de Exames */}
                            <div className={styles.tableContainer}>
                                <table className={styles.examTable}>
                                    <thead>
                                        <tr>
                                            <th style={{width: '40%'}}>Solicitação</th>
                                            <th style={{width: '40%'}}>Resultado</th>
                                            <th style={{textAlign: 'right'}}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.exams.map(exame => (
                                            <tr key={exame.id_exame}>
                                                <td>
                                                    <pre>{exame.solicitacao || <span style={{color: '#999', fontStyle: 'italic'}}>Sem descrição</span>}</pre>
                                                </td>
                                                <td>
                                                    {exame.resultado ? (
                                                        <>
                                                            <span className={styles.statusConcluido}><FaCheck/> Concluído</span>
                                                            <pre style={{marginTop: '5px', fontSize: '0.9em'}}>{exame.resultado}</pre>
                                                        </>
                                                    ) : (
                                                        <span className={styles.statusPendente}>Pendente</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className={styles.actionGroup}>
                                                        {/* Editar Solicitação */}
                                                        <button 
                                                            className={`${styles.btnTableAction} ${styles.btnEditReq}`}
                                                            onClick={() => handleEditExamRequest(exame)}
                                                            title="Editar lista de exames solicitados"
                                                        >
                                                            <FaPencilAlt /> Solic.
                                                        </button>

                                                        {/* Editar Resultado */}
                                                        <button 
                                                            className={`${styles.btnTableAction} ${styles.btnResult}`}
                                                            onClick={() => handleOpenExameModal(exame)}
                                                            title={exame.resultado ? "Editar Resultado" : "Adicionar Resultado"}
                                                        >
                                                            <FaFlask /> {exame.resultado ? "Edit. Res." : "Resultado"}
                                                        </button>

                                                        {/* Imprimir */}
                                                        <button 
                                                            className={styles.btnTableAction}
                                                            onClick={() => handlePrintExam(exame)}
                                                            title="Imprimir Pedido"
                                                        >
                                                            <FaPrint />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.noData}>
                        <FaBoxOpen />
                        <p>Nenhum exame encontrado.</p>
                      </div>
                    )}
                  </div>
                )}
                {/* -------------------------------- */}

                {activeTab === "vacinas" && (
                  <>
                    <div className={styles.contentHeader}>
                      <button
                        className={styles.actionButtonPrimary}
                        onClick={() => setIsVacinaModalOpen(true)}
                      >
                        <FaPlus /> Nova Vacina
                      </button>
                    </div>
                    <div className={styles.historyList}>
                      {vacinas.length > 0 ? (
                        vacinas.map((v) => (
                          <div key={v.id_vacina} className={styles.historyCard}>
                            <div className={styles.historyHeader}>
                              <span>{formatDate(v.data_aplic)}</span>
                              <h4>{v.nome}</h4>
                            </div>
                            <div className={styles.historyContent}>
                              <p>
                                <strong>Próxima Dose:</strong>{" "}
                                {v.data_prox
                                  ? formatDate(v.data_prox)
                                  : "Não agendada"}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.noData}>
                          <FaBoxOpen />
                          <p>Nenhuma vacina registrada.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AnimalDetailPage;