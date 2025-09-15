import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import styles from "./NovaConsultaModal.module.css";
import VacinaModal from "../Vacinas/VacinaModal";
import PdfGeneratorModal from "../Documentos/PdfGeneratorModal";
import HistoryModal from "./HistoryModal";
import {
  FaPaw, FaVenusMars, FaBirthdayCake, FaTag, FaBookMedical, FaStethoscope,
  FaEdit, FaCheck, FaTimes, FaSave, FaFilePrescription, FaVial, FaSyringe
} from 'react-icons/fa';

// --- COMPONENTE INTERNO MOVido PARA FORA ---
// Isso melhora a performance, pois o componente não é recriado a cada renderização.
function AutoResizeTextarea(props) {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
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

  const handleAddDose = (vacina) => {
    setInitialVacinaData({ nome: vacina.nome });
    setHistoryModalState({ isOpen: false, type: null });
    setIsVacinaModalOpen(true);
  };

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
            setAnamnesisData({
              castrado: animalResponse.castrado,
              alergias: animalResponse.alergias || "",
              obs: animalResponse.observacoes || "",
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
      finalValue = value === 'true';
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
    setIsVacinaModalOpen(false);
    alert("Vacina registrada com sucesso!");
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
              <h2><FaStethoscope /> Nova Consulta</h2>
              <button className={styles.closeButton} onClick={onClose}><FaTimes /></button>
            </div>

            {!loading && animal && (
              <div className={styles.headerAnimalInfo}>
                <div className={styles.animalAvatar}><FaPaw /></div>
                <div className={styles.animalBrief}>
                  <h3 className={styles.animalName}>{animal.nome}</h3>
                  <p className={styles.tutorName}>Tutor: {animal.tutor.nome}</p>
                </div>
                <div className={styles.animalDetails}>
                  <span><FaTag /> {animal.raca.especie.nome} / {animal.raca.nome}</span>
                  <span><FaVenusMars /> {animal.sexo === "F" ? "Fêmea" : "Macho"}</span>
                  <span><FaBirthdayCake /> {calculateAge(animal.data_nasc)}</span>
                </div>
                <button className={styles.prontuarioButton} onClick={() => window.open(`/animais/${animalId}`, '_blank')}>
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
                      <h3><FaBookMedical /> Anamnese</h3>
                      <button className={styles.editToggle} onClick={() => setIsAnamnesisEditing(!isAnamnesisEditing)}>
                        {isAnamnesisEditing ? <><FaCheck /> Concluir</> : <><FaEdit /> Editar</>}
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
                        <AutoResizeTextarea name="alergias" value={anamnesisData.alergias} onChange={handleAnamnesisChange} />
                      ) : (
                        <p className={styles.displayData}>{anamnesisData.alergias || "Nenhuma informação"}</p>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label>Observações</label>
                      {isAnamnesisEditing ? (
                        <AutoResizeTextarea name="obs" value={anamnesisData.obs} onChange={handleAnamnesisChange} />
                      ) : (
                        <p className={styles.displayData}>{anamnesisData.obs || "Nenhuma informação"}</p>
                      )}
                    </div>
                  </div>
                </aside>

                {/* --- COLUNA DIREITA (CONSULTA) --- */}
                <section className={styles.rightColumn}>
                  <div className={styles.sectionCard}>
                    <h4 className={styles.cardTitle}>Sinais Vitais</h4>
                    <div className={styles.vitalsGrid}>
                      <div className={styles.formGroup}><label>Peso (Kg)</label><input type="text" name="peso" value={formData.peso} onChange={handleChange} /></div>
                      <div className={styles.formGroup}><label>Temperatura (°C)</label><input type="text" name="temperatura" value={formData.temperatura} onChange={handleChange} /></div>
                      <div className={styles.formGroup}><label>TPC (seg)</label><input type="text" name="tpc" value={formData.tpc} onChange={handleChange} /></div>
                      <div className={styles.formGroup}><label>Mucosas</label><input type="text" name="mucosas" value={formData.mucosas} onChange={handleChange} /></div>
                      <div className={styles.formGroup}><label>Freq. Cardíaca</label><input type="text" name="freqCardiaca" value={formData.freqCardiaca} onChange={handleChange} /></div>
                      <div className={styles.formGroup}><label>Freq. Resp.</label><input type="text" name="freqResp" value={formData.freqResp} onChange={handleChange} /></div>
                    </div>
                  </div>
                  
                  <div className={styles.sectionCard}>
                    <h4 className={styles.cardTitle}>Avaliação Clínica</h4>
                    <div className={styles.formGroup}><label>Queixa Principal</label><AutoResizeTextarea name="queixaPrincipal" value={formData.queixaPrincipal} onChange={handleChange} /></div>
                    <div className={styles.formGroup}><label>Suspeita Clínica</label><AutoResizeTextarea name="suspeitaClinica" value={formData.suspeitaClinica} onChange={handleChange} /></div>
                    <div className={styles.formGroup}><label>Diagnóstico</label><AutoResizeTextarea name="diagnostico" value={formData.diagnostico} onChange={handleChange} /></div>
                    <div className={styles.formGroup}><label>Tratamento</label><AutoResizeTextarea name="tratamento" value={formData.tratamento} onChange={handleChange} /></div>
                  </div>
                </section>
              </main>

              <footer className={styles.footer}>
                <div className={styles.footerActions}>
                  <button className={styles.actionButton} onClick={() => handleOpenHistory("prescricoes")}><FaFilePrescription /> Prescrição</button>
                  <button className={styles.actionButton} onClick={() => handleOpenHistory("exames")}><FaVial /> Exames</button>
                  <button className={styles.actionButton} onClick={() => handleOpenHistory("vacinas")}><FaSyringe /> Vacinas</button>
                </div>
                <div className={styles.footerControls}>
                  <button className={styles.cancelButton} onClick={onClose}>Cancelar</button>
                  <button className={styles.saveButton} onClick={handleSaveConsulta} disabled={isSaving}><FaSave /> {isSaving ? "Salvando..." : "Salvar Consulta"}</button>
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