import React from "react";
// ✅ PASSO 1: Alterado para usar o CSS do NovaConsultaModal
import styles from "./NovaConsultaModal.module.css";
import api from "../../services/api";

function ConsultaDetailModal({ isOpen, onClose, consulta }) {
  if (!isOpen || !consulta) return null;

  // ✅ MANTIDO: Funções de formatação e impressão
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(dateString));
    } catch {
      return "—";
    }
  };

  const formatDateOnly = (dateString) => {
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

  const handleImprimir = async (tipo, id) => {
    const endpoint =
      tipo === "prescricao"
        ? `/prescricoes/${id}/imprimir`
        : `/exames/${id}/imprimir`;

    try {
      const response = await api.get(endpoint, true, "blob");
      const file = new Blob([response], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error(`Erro ao imprimir ${tipo}:`, error);
      alert(`Não foi possível gerar o PDF da ${tipo}.`);
    }
  };

  const c = consulta;

  return (
    // ✅ PASSO 2: Reestruturação completa do JSX
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho Principal */}
        <div className={styles.header}>
          <h2>Detalhes da Consulta</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Header do Animal */}
        <div className={styles.animalHeader}>
          <div className={styles.animalInfo}>
            <i className="fas fa-paw"></i>
            <h3>{c.animal?.nome || "Animal"}</h3>
          </div>
          <div className={styles.tutorInfo}>
            <p>
              <strong>Tutor:</strong> {c.animal?.tutor?.nome || "—"}
            </p>
            <p>
              <strong>CPF:</strong> {c.animal?.tutor?.cpf || "—"}
            </p>
            <p>
              <strong>Telefone:</strong> {c.animal?.tutor?.telefone || "—"}
            </p>
          </div>
          <div className={styles.animalActions}>
            {/* Pode adicionar botões aqui se quiser, como um de "Ver Histórico" */}
          </div>
        </div>

        {/* Corpo Principal (2 colunas) */}
        <div className={styles.mainBody}>
          {/* Painel Esquerdo - Anamnese */}
          <div className={styles.leftPanel}>
            <div className={styles.card}>
              <h4>🩺 Anamnese do Animal</h4>
              <div className={styles.anamneseGrid}>
                <div>
                  <label>Espécie</label>
                  <p>{c.animal?.raca?.especie?.nome || "—"}</p>
                </div>
                <div>
                  <label>Raça</label>
                  <p>{c.animal?.raca?.nome || "—"}</p>
                </div>
                <div>
                  <label>Sexo</label>
                  <p>{c.animal?.sexo === "F" ? "Fêmea" : "Macho"}</p>
                </div>
                <div>
                  <label>Porte</label>
                  <p>{c.animal?.porte || "—"}</p>
                </div>
                <div>
                  <label>Temperamento</label>
                  <p>{c.animal?.temperamento || "—"}</p>
                </div>
                <div>
                  <label>Idade</label>
                  <p>{calculateAge(c.animal?.data_nasc)}</p>
                </div>
                <div>
                  <label>Nascimento</label>
                  <p>{formatDateOnly(c.animal?.data_nasc)}</p>
                </div>
                <div>
                  <label>Castrado</label>
                  <p>{c.animal?.castrado ? "Sim" : "Não"}</p>
                </div>
              </div>
              <div className={styles.fullWidth}>
                <label>Alergias</label>
                <p>{c.animal?.alergias || "Nenhuma"}</p>
              </div>
              <div className={styles.fullWidth}>
                <label>Observações</label>
                <p>{c.animal?.observacoes || "Nenhuma"}</p>
              </div>
            </div>
          </div>

          {/* Painel Direito - Dados da Consulta */}
          <div className={styles.rightPanel}>
            {/* ✅ PASSO 3: Campos de exibição com 'readOnly' */}
            <div className={styles.vitalsGrid}>
              <div>
                <label>Peso</label>
                <input type="text" readOnly value={c.peso ?? "—"} />
              </div>
              <div>
                <label>Temperatura</label>
                <input type="text" readOnly value={c.temperatura ?? "—"} />
              </div>
              <div>
                <label>TPC</label>
                <input type="text" readOnly value={c.tpc ?? "—"} />
              </div>
              <div>
                <label>Mucosas</label>
                <input type="text" readOnly value={c.mucosas ?? "—"} />
              </div>
              <div>
                <label>Frequência Cardíaca</label>
                <input type="text" readOnly value={c.freq ?? "—"} />
              </div>
              <div>
                <label>Frequência Respiratória</label>
                <input type="text" readOnly value={c.resp ?? "—"} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Queixa principal</label>
              <textarea
                readOnly
                value={c.queixa || "Nenhuma queixa registrada."}
              ></textarea>
            </div>
            <div className={styles.formGroup}>
              <label>Suspeita Clínica</label>
              <textarea
                readOnly
                value={c.suspeita || "Nenhuma suspeita registrada."}
              ></textarea>
            </div>
            <div className={styles.formGroup}>
              <label>Diagnóstico</label>
              <textarea
                readOnly
                value={c.diagnostico || "Nenhum diagnóstico registrado."}
              ></textarea>
            </div>
            <div className={styles.formGroup}>
              <label>Tratamento</label>
              <textarea
                readOnly
                value={c.tratamento || "Nenhum tratamento registrado."}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className={styles.footer}>
          <div className={styles.footerActions}>
            {c.prescricao && c.prescricao.length > 0 && (
              <button
                className={styles.actionButton}
                onClick={() =>
                  handleImprimir("prescricao", c.prescricao[0].id_prescricao)
                }
              >
                <i className="fas fa-file-prescription"></i> Imprimir Prescrição
              </button>
            )}
            {c.exame && c.exame.length > 0 && (
              <button
                className={styles.actionButton}
                onClick={() => handleImprimir("exame", c.exame[0].id_exame)}
              >
                <i className="fas fa-vial"></i> Imprimir Exames
              </button>
            )}
          </div>
          <div className={styles.footerControls}>
            <button className={styles.saveButton} onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsultaDetailModal;
