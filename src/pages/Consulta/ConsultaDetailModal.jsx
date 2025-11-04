import React from "react";
import styles from "./NovaConsultaModal.module.css"; // Reutilizando o mesmo estilo
import api from "../../services/api";
import toast from 'react-hot-toast';
import {
  FaPaw, FaVenusMars, FaBirthdayCake, FaTag, FaBookMedical, FaStethoscope,
  FaTimes, FaFilePrescription, FaVial
} from 'react-icons/fa'; // Importando ícones

function ConsultaDetailModal({ isOpen, onClose, consulta }) {
  if (!isOpen || !consulta) return null;

  const formatDateOnly = (dateString) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
      new Date(dateString)
    );
  };

  const calculateAge = (birthDate, consultDate) => {
    if (!birthDate || !consultDate) return "—";
    const ageInMilliseconds = new Date(consultDate) - new Date(birthDate);
    if (ageInMilliseconds < 0) return "Data inválida";
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    const years = Math.floor(ageInYears);
    const months = Math.floor((ageInYears - years) * 12);
    if (years > 0) {
      return `${years} ano(s)${months > 0 ? ` e ${months} mes(es)` : ""}`;
    }
    return `${months} mes(es)`;
  };

  const handleImprimir = async (tipo, idConsulta) => {
    const endpoint =
      tipo === "prescricao"
        ? `/consultas/${idConsulta}/prescricoes/imprimir`
        : `/consultas/${idConsulta}/exames/imprimir`;

    try {
      const response = await api.get(endpoint, true, "blob");
      const file = new Blob([response], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error(`Erro ao imprimir ${tipo}:`, error);
      toast.error(`Não foi possível gerar o PDF de ${tipo}.`);
    }
  };

  const c = consulta;
  const anamneseDaConsulta = c.anamnese?.[0];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* === CABEÇALHO PADRONIZADO === */}
        <header className={styles.header}>
          <div className={styles.headerTopRow}>
            <h2><FaStethoscope /> Detalhes da Consulta ({formatDateOnly(c.data)})</h2>
            <button className={styles.closeButton} onClick={onClose}><FaTimes /></button>
          </div>

          <div className={styles.headerAnimalInfo}>
            <div className={styles.animalAvatar}><FaPaw /></div>
            <div className={styles.animalBrief}>
              <h3 className={styles.animalName}>{c.animal?.nome || "Animal"}</h3>
              <p className={styles.tutorName}>Tutor: {c.animal?.tutor?.nome || "—"}</p>
            </div>
            <div className={styles.animalDetails}>
              <span><FaTag /> {c.animal?.raca?.especie?.nome || "—"} / {c.animal?.raca?.nome || "—"}</span>
              <span><FaVenusMars /> {c.animal?.sexo === "F" ? "Fêmea" : "Macho"}</span>
              <span><FaBirthdayCake /> {calculateAge(c.animal?.data_nasc, c.data)}</span>
            </div>
            <div className={styles.vetInfo} style={{marginLeft: 'auto', color: '#555'}}>
              <strong>Veterinário:</strong> {c.veterinario?.nome || "—"}
            </div>
          </div>
        </header>

        {/* === CORPO PRINCIPAL PADRONIZADO === */}
        <main className={styles.mainBody}>
          {/* --- COLUNA ESQUERDA (ANAMNESE) --- */}
          <aside className={styles.leftColumn}>
            <div className={styles.anamnesisCard}>
              <div className={styles.cardHeader}>
                <h3><FaBookMedical /> Anamnese da Consulta</h3>
              </div>
              <div className={styles.formGroupInline}>
                <label htmlFor="castrado">Castrado?</label>
                <p className={styles.displayData}>{anamneseDaConsulta?.castrado ? "Sim" : "Não"}</p>
              </div>
              <div className={styles.formGroup}>
                <label>Alergias Registradas</label>
                <p className={styles.displayData}>{anamneseDaConsulta?.alergias || "Nenhuma"}</p>
              </div>
              <div className={styles.formGroup}>
                <label>Observações</label>
                <p className={styles.displayData}>{anamneseDaConsulta?.obs || "Nenhuma"}</p>
              </div>
            </div>
          </aside>

          {/* --- COLUNA DIREITA (CONSULTA) --- */}
          <section className={styles.rightColumn}>
            <div className={styles.sectionCard}>
              <h4 className={styles.cardTitle}>Sinais Vitais</h4>
              <div className={styles.vitalsGrid}>
                <div className={styles.formGroup}><label>Peso (Kg)</label><p className={styles.displayData}>{c.peso ?? "—"}</p></div>
                <div className={styles.formGroup}><label>Temperatura (°C)</label><p className={styles.displayData}>{c.temperatura ?? "—"}</p></div>
                <div className={styles.formGroup}><label>TPC (seg)</label><p className={styles.displayData}>{c.tpc ?? "—"}</p></div>
                <div className={styles.formGroup}><label>Mucosas</label><p className={styles.displayData}>{c.mucosas ?? "—"}</p></div>
                <div className={styles.formGroup}><label>Freq. Cardíaca</label><p className={styles.displayData}>{c.freq ?? "—"}</p></div>
                <div className={styles.formGroup}><label>Freq. Resp.</label><p className={styles.displayData}>{c.resp ?? "—"}</p></div>
              </div>
            </div>

            <div className={styles.sectionCard}>
              <h4 className={styles.cardTitle}>Avaliação Clínica</h4>
              <div className={styles.formGroup}><label>Queixa Principal</label><p className={styles.displayData}>{c.queixa || "—"}</p></div>
              <div className={styles.formGroup}><label>Suspeita Clínica</label><p className={styles.displayData}>{c.suspeita || "—"}</p></div>
              <div className={styles.formGroup}><label>Diagnóstico</label><p className={styles.displayData}>{c.diagnostico || "—"}</p></div>
              <div className={styles.formGroup}><label>Tratamento</label><p className={styles.displayData}>{c.tratamento || "—"}</p></div>
            </div>
          </section>
        </main>

        {/* === RODAPÉ PADRONIZADO === */}
        <footer className={styles.footer}>
          <div className={styles.footerActions}>
            {c.prescricao && c.prescricao.length > 0 && (
              <button className={styles.actionButton} onClick={() => handleImprimir("prescricao", c.id_consulta)}>
                <FaFilePrescription /> Imprimir Prescrição
              </button>
            )}
            {c.exame && c.exame.length > 0 && (
              <button className={styles.actionButton} onClick={() => handleImprimir("exame", c.id_consulta)}>
                <FaVial /> Imprimir Exames
              </button>
            )}
          </div>
          <div className={styles.footerControls}>
            <button className={styles.cancelButton} onClick={onClose}>
              Fechar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ConsultaDetailModal;