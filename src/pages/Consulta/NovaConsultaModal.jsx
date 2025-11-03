import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import styles from "./NovaConsultaModal.module.css";
import VacinaModal from "../Vacinas/VacinaModal";
import PdfGeneratorModal from "../Documentos/PdfGeneratorModal";
import HistoryModal from "./HistoryModal";

// --- NOVAS IMPORTAÇÕES ---
import HelpModal from "../Help/HelpModal";
import helpButtonStyles from "../Help/HelpButton.module.css";
// -------------------------

import {
  FaPaw,
  FaVenusMars,
  FaBirthdayCake,
  FaTag,
  FaBookMedical,
  FaStethoscope,
  FaEdit,
  FaCheck,
  FaTimes,
  FaSave,
  FaFilePrescription,
  FaVial,
  FaSyringe,
  FaNotesMedical,
  FaPlus,
  FaQuestionCircle // <-- ÍCONE ADICIONADO
} from "react-icons/fa";

// --- COMPONENTE INTERNO MOVido PARA FORA ---
function AutoResizeTextarea(props) {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [props.value]);

  return (
    <textarea
      ref={textareaRef}
      {...props}
      onInput={adjustHeight}
      rows={1}
      className={styles.autoResizeTextarea}
    />
  );
}

const initialConsultaState = {
  peso: "",
  temperatura: "",
  tpc: "",
  mucosas: "",
  freqCardiaca: "",
  freqResp: "",
  queixaPrincipal: "",
  suspeitaClinica: "",
  diagnostico: "",
  tratamento: "",
  prescricao: "",
  exame: "",
};

function NovaConsultaModal({
  isOpen,
  onClose,
  onSave,
  animalId,
  agendamentoId,
}) {
  const [animal, setAnimal] = useState(null);
  const [veterinario, setVeterinario] = useState(null);
  const [formData, setFormData] = useState(initialConsultaState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVacinaModalOpen, setIsVacinaModalOpen] = useState(false);
  const [pdfModalState, setPdfModalState] = useState({
    isOpen: false,
    type: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [initialVacinaData, setInitialVacinaData] = useState(null);
  const [isAnamnesisEditing, setIsAnamnesisEditing] = useState(false);
  const [anamnesisData, setAnamnesisData] = useState({
    castrado: false,
    alergias: "",
    obs: "",
  });
  const [historyModalState, setHistoryModalState] = useState({
    isOpen: false,
    type: null,
  });
<<<<<<< HEAD
  const [validationErrors, setValidationErrors] = useState({});

  // --- NOVOS ESTADOS DE AJUDA ---
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpContent, setHelpContent] = useState(null);
  const [helpLoading, setHelpLoading] = useState(false);
  // ------------------------------

  // --- NOVA FUNÇÃO DE AJUDA ---
  const handleOpenHelp = async () => {
    setHelpLoading(true);
    try {
      // Usando a "pageKey" 'consulta-nova'
      const data = await api.getHelpContent('consulta-nova'); 
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
=======
  // Adicione esta linha junto com os outros useStates
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
>>>>>>> ede233b4a52ed9396eab1319237d2f396bd8d115

  const handleAddDose = (vacina) => {
    setInitialVacinaData({ nome: vacina.nome });
    setHistoryModalState({ isOpen: false, type: null });
    setIsVacinaModalOpen(true);
  };
 
  const validateForm = () => {
   const errors = {};
   const { peso, temperatura, tpc, freqCardiaca, freqResp } = formData;

   const validateNumber = (value, name, min, max, allowDecimal = true) => {
     if (value === "") return;
     const numValue = allowDecimal ? parseFloat(value) : parseInt(value, 10);

     if (isNaN(numValue)) {
       errors[name] = "Deve ser um número.";
       return;
     }
     if (numValue < min || numValue > max) {
       errors[name] = `Valor fora da faixa normal (${min} - ${max}).`;
     }
   };

   validateNumber(peso, "peso", 0.1, 150);
   validateNumber(temperatura, "temperatura", 35.0, 42.0);
   validateNumber(tpc, "tpc", 0, 5, false);
   validateNumber(freqCardiaca, "freqCardiaca", 40, 250, false);
   validateNumber(freqResp, "freqResp", 5, 80, false);

   setValidationErrors(errors);
   return Object.keys(errors).length === 0;
  };

  useEffect(() => {
   if (isOpen) {
     validateForm();
   }
  }, [formData, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // A validação completa só é necessária quando a modal está aberta
    if (isOpen) {
        const errors = {};
        const { peso, temperatura, tpc, freqCardiaca, freqResp } = formData;

        // Função auxiliar para validar números
        const validateNumber = (value, name, min, max, allowDecimal = true) => {
            if (value === "") return; // Campo pode ser vazio
            const numValue = allowDecimal ? parseFloat(value) : parseInt(value, 10);
            
            if (isNaN(numValue)) {
                errors[name] = "Deve ser um número.";
                return;
            }
            if (numValue < min || numValue > max) {
                errors[name] = `Insira um valor entre: ${min} - ${max}.`;
            }
        };

        // Validações para cada campo
        validateNumber(peso, "peso", 0.1, 150);
        validateNumber(temperatura, "temperatura", 35.0, 42.0);
        validateNumber(tpc, "tpc", 0, 5, false);
        validateNumber(freqCardiaca, "freqCardiaca", 40, 250, false);
        validateNumber(freqResp, "freqResp", 5, 80, false);

        setValidationErrors(errors);
    }
  }, [formData, isOpen]);

  useEffect(() => {
    if (isOpen && animalId) {
      setLoading(true);
      setError("");
      setFormData(initialConsultaState);
      setIsAnamnesisEditing(false);

      const fetchInitialData = async () => {
        try {
          const animalResponse = await api.getAnimalById(animalId);
          setAnimal(animalResponse);

          const vetId = localStorage.getItem("vet_id");
          if (vetId) {
            const vetResponse = await api.getVeterinarioById(vetId);
            setVeterinario(vetResponse);
          } else {
            throw new Error("ID do veterinário não encontrado.");
          }

          const anamnesesResponse = await api.getAnamnesesByAnimal(animalId);
          if (anamnesesResponse && anamnesesResponse.length > 0) {
            const ultimaAnamnese = anamnesesResponse[0];
            setAnamnesisData({
              castrado: ultimaAnamnese.castrado,
              alergias: ultimaAnamnese.alergias || "",
              obs: ultimaAnamnese.obs || "",
            });
          } else {
            // Se não há anamnese, busca do cadastro do animal (se houver)
            setAnamnesisData({
              castrado: animalResponse.castrado, // Assumindo que animal tem 'castrado'
              alergias: animalResponse.alergias || "", // Assumindo que animal tem 'alergias'
              obs: animalResponse.observacoes || "", // Assumindo que animal tem 'observacoes'
            });
          }
        } catch (err) {
          setError("Não foi possível carregar os dados necessários.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchInitialData();
    }
  }, [isOpen, animalId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenHistory = (type) => {
    setHistoryModalState({ isOpen: true, type });
  };

  const handleAnamnesisChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue;

    if (name === "castrado") {
      finalValue = value === "true";
    } else if (type === "checkbox") {
      finalValue = checked;
    } else {
      finalValue = value;
    }

    setAnamnesisData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSaveConsulta = async () => {
    // Agora a validação é feita em tempo real
    if (Object.keys(validationErrors).length > 0) {
      alert("Por favor, corrija os erros nos campos antes de salvar.");
      return;
    }

    if (!formData.queixaPrincipal) {
      alert("O campo 'Queixa principal' é obrigatório para salvar.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const dadosConsultaParaApi = {
        queixa: formData.queixaPrincipal,
        suspeita: formData.suspeitaClinica,
        diagnostico: formData.diagnostico,
        tratamento: formData.tratamento,
        mucosas: formData.mucosas || null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        temperatura: formData.temperatura
          ? parseFloat(formData.temperatura)
          : null,
        tpc: formData.tpc ? parseInt(formData.tpc, 10) : null,
        freq: formData.freqCardiaca
          ? parseInt(formData.freqCardiaca, 10)
          : null,
        resp: formData.freqResp ? parseInt(formData.freqResp, 10) : null,
        prescricao: formData.prescricao
          ? [{ descricao: formData.prescricao }]
          : [],
        exame: formData.exame ? [{ solicitacao: formData.exame }] : [],
        anamnese: {
          castrado: anamnesisData.castrado,
          alergias: anamnesisData.alergias,
          obs: anamnesisData.obs,
        },
      };

      if (agendamentoId) {
        await api.createConsultaFromAgendamento(
          agendamentoId,
          dadosConsultaParaApi
        );
      } else {
        const payload = {
          ids: {
            id_animal: animal.id_animal,
            id_tutor: animal.tutor.id_tutor,
          },
          dadosConsulta: dadosConsultaParaApi,
        };
        await api.createConsulta(payload);
      }

      alert("Consulta salva com sucesso!");
      onSave();
    } catch (err) {
      setError(
        err.response?.data?.message || "Ocorreu um erro ao salvar a consulta."
      );
      console.error("Erro ao salvar consulta:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVacinaSave = () => {
    setIsVacinaModalOpen(false); // Fecha o modal de vacina
    
    // Força o HistoryModal a recarregar, incrementando o gatilho
    setHistoryRefreshTrigger(prev => prev + 1);
    
    // Podemos manter ou remover o alert, como preferir
    alert("Vacina registrada com sucesso!");
    
    // Reabre o histórico de vacinas para o usuário ver a atualização
    setHistoryModalState({ isOpen: true, type: 'vacinas' });
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
    if (years > 0) {
      return `${years} ano(s)${months > 0 ? ` e ${months} mes(es)` : ""}`;
    }
    return `${months} mes(es)`;
  };

  const handleOpenPdfModal = (type) => {
    setPdfModalState({ isOpen: true, type: type });
  };

  const handleGeneratePdf = async (text) => {
    const { type } = pdfModalState;
    setFormData((prev) => ({ ...prev, [type]: text }));
    const isPrescricao = type === "prescricao";

    const payload = {
      nome_tutor: animal?.tutor?.nome ?? "Não informado",
      nome_animal: animal?.nome ?? "Não informado",
      especie: animal?.raca?.especie?.nome ?? "N/A",
      raca: animal?.raca?.nome ?? "N/A",
      idade: calculateAge(animal?.data_nasc),
      peso: formData.peso ? `${formData.peso} Kg` : "N/A",
      nome_veterinario: veterinario?.nome ?? "Não informado",
      crmv_veterinario: veterinario?.crmv ?? "N/A",
      data_consulta: new Date().toISOString(),
      ...(isPrescricao
        ? {
            descricoes_prescricao: text
              .split("\n")
              .filter((line) => line.trim() !== ""),
          }
        : {
            solicitacoes_exame: text
              .split("\n")
              .filter((line) => line.trim() !== ""),
          }),
    };

    try {
      const response = isPrescricao
        ? await api.gerarPrescricaoPreview(payload)
        : await api.gerarExamePreview(payload);

      const file = new Blob([response], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
      setPdfModalState({ isOpen: false, type: null });
    } catch (error) {
      console.error(`Erro ao gerar PDF de ${type}:`, error);
      alert(`Não foi possível gerar o PDF de ${type}.`);
    }
  };

  const handleAddNewFromHistory = () => {
    const { type } = historyModalState;
    setHistoryModalState({ isOpen: false, type: null });

    if (type === "vacinas") {
      setInitialVacinaData(null);
      setIsVacinaModalOpen(true);
    } else if (type === "exames") {
      handleOpenPdfModal("exame");
    } else if (type === "prescricoes") {
      handleOpenPdfModal("prescricao");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* MODAL DE AJUDA */}
      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        content={helpContent}
      />

      {animal && (
        <VacinaModal
          isOpen={isVacinaModalOpen}
          onClose={() => setIsVacinaModalOpen(false)}
          onSave={handleVacinaSave}
          animalId={animal.id_animal}
          initialData={initialVacinaData}
        />
      )}
      <HistoryModal
        isOpen={historyModalState.isOpen}
        onClose={() => setHistoryModalState({ isOpen: false, type: null })}
        animalId={animal?.id_animal}
        type={historyModalState.type}
        onAddNew={handleAddNewFromHistory}
        onAddDose={handleAddDose}
        refreshTrigger={historyRefreshTrigger}
      />
      <PdfGeneratorModal
        isOpen={pdfModalState.isOpen}
        onClose={() => setPdfModalState({ isOpen: false, type: null })}
        onGeneratePdf={handleGeneratePdf}
        title={
          pdfModalState.type === "prescricao"
            ? "Gerar Prescrição"
            : "Gerar Solicitação de Exame"
        }
        label={
          pdfModalState.type === "prescricao"
            ? "Prescrição"
            : "Exames Solicitados"
        }
        initialText={formData[pdfModalState.type]}
      />
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <header className={styles.header}>
            <div className={styles.headerTopRow}>
              
              {/* TÍTULO MODIFICADO */}
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaStethoscope /> Nova Consulta
                {/* BOTÃO DE AJUDA ADICIONADO AQUI */}
                <button 
                  className={helpButtonStyles.helpIcon} 
                  onClick={handleOpenHelp}
                  disabled={helpLoading}
                  title="Ajuda sobre este formulário"
                >
                  <FaQuestionCircle />
                </button>
              </h2>
              
              <button className={styles.closeButton} onClick={onClose}>
                <FaTimes />
              </button>
            </div>
            {!loading && animal && (
              <div className={styles.headerAnimalInfo}>
                <div className={styles.animalAvatar}>
                  <FaPaw />
                </div>
                <div className={styles.animalBrief}>
                  <h3 className={styles.animalName}>{animal.nome}</h3>
                  <p className={styles.tutorName}>Tutor: {animal.tutor.nome}</p>
                </div>
                <div className={styles.animalDetails}>
                  <span>
                    <FaTag /> {animal.raca.especie.nome} / {animal.raca.nome}
                  </span>
                  <span>
                    <FaVenusMars /> {animal.sexo === "F" ? "Fêmea" : "Macho"}
                  </span>
                  <span>
                    <FaBirthdayCake /> {calculateAge(animal.data_nasc)}
                  </span>
                </div>
                <button
                  className={styles.actionButtonNeutral}
                  onClick={() => window.open(`/animais/${animalId}`, "_blank")}
                >
                  Ver Prontuário
                </button>
              </div>
            )}
          </header>
          {loading && <p className={styles.loadingText}>Carregando...</p>}
          {error && <p className={styles.errorText}>{error}</p>}
          {!loading && !error && animal && (
            <>
              <main className={styles.mainBody}>
                {/* --- COLUNA ESQUERDA (ANAMNESE) --- */}
                <aside className={styles.leftColumn}>
                  <div className={styles.anamnesisCard}>
                    <div className={styles.cardHeader}>
                      <h3>
                        <FaBookMedical /> Anamnese
                      </h3>
                      <button
                        className={styles.editToggle}
                        onClick={() =>
                          setIsAnamnesisEditing(!isAnamnesisEditing)
                        }
                      >
                        {isAnamnesisEditing ? (
                          <>
                            <FaCheck /> Concluir
                          </>
                        ) : (
                          <>
                            <FaEdit /> Editar
                          </>
                        )}
                      </button>
                    </div>
                    <div className={styles.formGroupInline}>
                      <label htmlFor="castrado">Castrado?</label>
                      <select
                        id="castrado"
                        name="castrado"
                        value={anamnesisData.castrado}
                        onChange={handleAnamnesisChange}
                        disabled={!isAnamnesisEditing}
                        className={styles.selectInput}
                      >
                        <option value={true}>Sim</option>
                        <option value={false}>Não</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Alergias</label>
                      {isAnamnesisEditing ? (
                        <AutoResizeTextarea
                          name="alergias"
                          value={anamnesisData.alergias}
                          onChange={handleAnamnesisChange}
                        />
                      ) : (
                        <p className={styles.displayData}>
                          {anamnesisData.alergias || "Nenhuma informação"}
                        </p>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label>Observações</label>
                      {isAnamnesisEditing ? (
                        <AutoResizeTextarea
                          name="obs"
                          value={anamnesisData.obs}
                          onChange={handleAnamnesisChange}
                        />
                      ) : (
                        <p className={styles.displayData}>
                          {anamnesisData.obs || "Nenhuma informação"}
                        </p>
                      )}
                    </div>
                  </div>
                </aside>
                {/* --- COLUNA DIREITA (CONSULTA) --- */}
                <section className={styles.rightColumn}>
                  <div className={styles.sectionCard}>
                    <h4 className={styles.cardTitle}>Sinais Vitais</h4>
                    <div className={styles.vitalsGrid}>
                      <div className={styles.formGroup}>
                        <label>Peso (Kg)</label>
                        <input
                          type="text"
                          name="peso"
                          value={formData.peso}
                          onChange={handleChange}
                        />
                        {validationErrors.peso && (
                          <p className={styles.errorInput}>{validationErrors.peso}</p>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label>Temperatura (°C)</label>
                        <input
                          type="text"
                          name="temperatura"
                          value={formData.temperatura}
                          onChange={handleChange}
                        />
                        {validationErrors.temperatura && (
                          <p className={styles.errorInput}>{validationErrors.temperatura}</p>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label>TPC (seg)</label>
                        <input
                          type="text"
                          name="tpc"
                          value={formData.tpc}
                          onChange={handleChange}
                        />
                         {validationErrors.tpc && (
                          <p className={styles.errorInput}>{validationErrors.tpc}</p>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label>Mucosas</label>
                        <input
                          type="text"
                          name="mucosas"
                          value={formData.mucosas}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Freq. Cardíaca</label>
                        <input
                          type="text"
                          name="freqCardiaca"
                          value={formData.freqCardiaca}
                          onChange={handleChange}
                        />
                         {validationErrors.freqCardiaca && (
                          <p className={styles.errorInput}>{validationErrors.freqCardiaca}</p>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label>Freq. Resp.</label>
                        <input
                          type="text"
                          name="freqResp"
                          value={formData.freqResp}
                          onChange={handleChange}
                        />
                        {validationErrors.freqResp && (
                          <p className={styles.errorInput}>{validationErrors.freqResp}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.sectionCard}>
                    <h4 className={styles.cardTitle}>Avaliação Clínica</h4>
                    <div className={styles.formGroup}>
                      <label>Queixa Principal</label>
                      <AutoResizeTextarea
                        name="queixaPrincipal"
                        value={formData.queixaPrincipal}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Suspeita Clínica</label>
                      <AutoResizeTextarea
                        name="suspeitaClinica"
                        value={formData.suspeitaClinica}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Diagnóstico</label>
                      <AutoResizeTextarea
                        name="diagnostico"
                        value={formData.diagnostico}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tratamento</label>
                      <AutoResizeTextarea
                        name="tratamento"
                        value={formData.tratamento}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </section>
              </main>
              <footer className={styles.footer}>
                <div className={styles.footerActions}>
                  <button
                    className={styles.actionButtonNeutral}
                    onClick={() => handleOpenHistory("prescricoes")}
                  >
                    <FaFilePrescription /> Prescrições
                  </button>
                  <button
                    className={styles.actionButtonNeutral}
                    onClick={() => handleOpenHistory("exames")}
                  >
                    <FaVial /> Exames
                  </button>
                  <button
                    className={styles.actionButtonNeutral}
                    onClick={() => handleOpenHistory("vacinas")}
                  >
                    <FaSyringe /> Vacinas
                  </button>
                </div>
                <div className={styles.footerControls}>
                  <button
                    className={styles.actionButtonNeutral}
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    className={styles.actionButtonPrimary}
                    onClick={handleSaveConsulta}
                    disabled={isSaving}
                  >
                    <FaSave /> {isSaving ? "Salvando..." : "Salvar Consulta"}
                  </button>
                </div>
              </footer>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default NovaConsultaModal;