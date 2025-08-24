// pages/Consulta/NovaConsultaModal.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./NovaConsultaModal.module.css";

const initialConsultaState = {
  peso: "",
  temperatura: "",
  tpc: "",
  mucosas: "",
  freq: "",
  resp: "",
  queixa: "",
  diagnostico: "",
  tratamento: "",
};

function NovaConsultaModal({ isOpen, onClose, onSave, animalId }) {
  const [animal, setAnimal] = useState(null);
  const [formData, setFormData] = useState(initialConsultaState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Busca os dados completos do animal quando o modal abre ou o ID do animal muda
  useEffect(() => {
    if (isOpen && animalId) {
      console.log("🔎 Abrindo modal para animalId:", animalId);
      setLoading(true);
      setError("");
      setFormData(initialConsultaState);
  
      api.get(`/animais/${animalId}`)
        .then(response => {
          // ✅ CORREÇÃO APLICADA AQUI: use 'response' diretamente
          console.log("📦 Resposta da API:", response);
          setAnimal(response);
        })
        .catch(err => {
          console.error("❌ Erro na API:", err);
          setError("Não foi possível carregar os dados do animal.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, animalId]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // pages/Consulta/NovaConsultaModal.jsx

  const handleSubmit = async () => {
    // Validação simples para garantir que a queixa principal foi preenchida
    if (!formData.queixa) {
      setError("A Queixa Principal é obrigatória.");
      return;
    }
    setLoading(true);
    setError("");

    try {
        // ✅ INÍCIO DA CORREÇÃO: Converte os dados do formulário para os tipos corretos
        const dadosConsultaParaBackend = {
          // Campos de texto continuam como estão
          queixa: formData.queixa,
          diagnostico: formData.diagnostico,
          tratamento: formData.tratamento,
          mucosas: formData.mucosas,
          
          // Converte campos numéricos para números (ou null se vazios)
          // parseFloat é usado para números que podem ter decimais (ex: peso, temperatura)
          peso: formData.peso ? parseFloat(formData.peso) : null,
          temperatura: formData.temperatura ? parseFloat(formData.temperatura) : null,
          
          // parseInt é usado para números inteiros
          tpc: formData.tpc ? parseInt(formData.tpc, 10) : null,
          freq: formData.freq ? parseInt(formData.freq, 10) : null,
          resp: formData.resp ? parseInt(formData.resp, 10) : null,
        };
        // ✅ FIM DA CORREÇÃO
  
        const payload = {
          ids: {
            id_animal: animal.id_animal,
            id_tutor: animal.tutor.id_tutor,
          },
          dadosConsulta: {
            ...dadosConsultaParaBackend,
            data: new Date(),
            status: 'finalizada',
          },
        };

      // ✅ AQUI A MÁGICA ACONTECE: Enviando os dados para o back-end
      await api.post("/consultas", payload);

      onSave(); // Fecha o modal e atualiza a lista principal
    } catch (err) {
      setError(err.message || "Ocorreu um erro ao salvar a consulta.");
      console.error(err);
    } finally {
      setLoading(false);
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
    return `${Math.floor(
      (new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24 * 365.25)
    )} anos`;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          {loading || !animal ? (
            <h2>Carregando...</h2>
          ) : (
            <div>
              <h2>Nova Consulta: {animal.nome}</h2>
              <div className={styles.headerMeta}>
                <span>
                  <strong>Tutor:</strong> {animal.tutor?.nome || "—"}
                </span>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ padding: "20px" }}>Carregando dados do paciente...</div>
        ) : error ? (
          <div style={{ padding: "20px", color: "red" }}>{error}</div>
        ) : (
          animal && (
            <>
              <div className={styles.modalBody}>
                {/* PAINEL ESQUERDO: DADOS DO ANIMAL (ANAMNESE) */}
                <div className={styles.leftPanel}>
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3>🩺 Anamnese</h3>
                    </div>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <label>Espécie</label>
                        <div className={styles.roInput}>
                          {animal.raca?.especie?.nome || "—"}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Raça</label>
                        <div className={styles.roInput}>
                          {animal.raca?.nome || "—"}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Sexo</label>
                        <div className={styles.roInput}>
                          {animal.sexo === "F" ? "Fêmea" : "Macho"}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Porte</label>
                        <div className={styles.roInput}>
                          {animal.porte || "—"}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Idade</label>
                        <div className={styles.roInput}>
                          {calculateAge(animal.data_nasc)}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Nascimento</label>
                        <div className={styles.roInput}>
                          {formatDate(animal.data_nasc)}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Temperamento</label>
                        <div className={styles.roInput}>
                          {animal.temperamento || "—"}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Castrado</label>
                        <div className={styles.roInput}>
                          {animal.castrado ? "Sim" : "Não"}
                        </div>
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Alergias</label>
                      <div className={styles.roBlock}>
                        {animal.alergias || "Nenhuma alergia registrada."}
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Observações</label>
                      <div className={styles.roBlock}>
                        {animal.observacoes || "Nenhuma observação registrada."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PAINEL DIREITO: FORMULÁRIO DA CONSULTA */}
                <div className={styles.rightPanel}>
                  <div className={styles.vitalsGrid}>
                    <div className={styles.formGroup}>
                      <label>Peso</label>
                      <input
                        type="text"
                        name="peso"
                        value={formData.peso}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Temperatura</label>
                      <input
                        type="text"
                        name="temperatura"
                        value={formData.temperatura}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>TPC</label>
                      <input
                        type="text"
                        name="tpc"
                        value={formData.tpc}
                        onChange={handleChange}
                      />
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
                      <label>Frequência Cardíaca</label>
                      <input
                        type="text"
                        name="freq"
                        value={formData.freq}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Frequência Respiratória</label>
                      <input
                        type="text"
                        name="resp"
                        value={formData.resp}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Queixa Principal</label>
                    <textarea
                      name="queixa"
                      value={formData.queixa}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Diagnóstico</label>
                    <textarea
                      name="diagnostico"
                      value={formData.diagnostico}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Tratamento</label>
                    <textarea
                      name="tratamento"
                      value={formData.tratamento}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  onClick={handleSubmit}
                >
                  Salvar
                </button>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

export default NovaConsultaModal;