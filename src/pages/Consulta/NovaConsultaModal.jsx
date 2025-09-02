import React, { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./NovaConsultaModal.module.css";
import VacinaModal from '../Vacinas/VacinaModal';
import PdfGeneratorModal from '../Documentos/PdfGeneratorModal';

const initialConsultaState = {
  peso: "", temperatura: "", tpc: "", mucosas: "", freqCardiaca: "", freqResp: "",
  queixaPrincipal: "", suspeitaClinica: "", diagnostico: "", tratamento: "",
  prescricao: "", exame: "",
};

function NovaConsultaModal({ isOpen, onClose, onSave, animalId }) {
  const [animal, setAnimal] = useState(null);
  const [veterinario, setVeterinario] = useState(null);
  const [formData, setFormData] = useState(initialConsultaState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVacinaModalOpen, setIsVacinaModalOpen] = useState(false);
  const [pdfModalState, setPdfModalState] = useState({ isOpen: false, type: null });


  useEffect(() => {
    if (isOpen && animalId) {
      setLoading(true);
      setError("");
      setFormData(initialConsultaState);
      const fetchInitialData = async () => {
        try {
          const animalResponse = await api.get(`/animais/${animalId}`);
          setAnimal(animalResponse);
          const vetId = localStorage.getItem("vet_id");
          if (vetId) {
            const vetResponse = await api.get(`/veterinarios/${vetId}`);
            setVeterinario(vetResponse);
          } else {
            throw new Error("ID do veterinário não encontrado.");
          }
        } catch (err) {
          setError("Não foi possível carregar os dados necessários.");
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
  
  const handleSaveConsulta = async () => {
    // Lógica para salvar a consulta...
    console.log("Salvando consulta...", formData);
    onSave();
  };
  
  const handleVacinaSave = () => {
    setIsVacinaModalOpen(false);
    alert('Vacina registrada com sucesso!');
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
    if (years > 0) {
      return `${years} ano(s)${months > 0 ? ` e ${months} mes(es)` : ''}`;
    }
    return `${months} mes(es)`;
  };


  // ✅ 3. Função para abrir o modal de PDF
  const handleOpenPdfModal = (type) => { // type será 'prescricao' ou 'exame'
    setPdfModalState({ isOpen: true, type: type });
  };

  // ✅ 4. Função que é chamada pelo modal de PDF para gerar o documento
  const handleGeneratePdf = async (text) => {
    const { type } = pdfModalState;
    
    // Atualiza o formulário principal com o texto digitado
    setFormData(prev => ({ ...prev, [type]: text }));

    const isPrescricao = type === 'prescricao';
    const endpoint = isPrescricao ? '/documentos/prescricao/visualizar' : '/documentos/exame/visualizar';

    const payload = {
      nome_tutor: animal?.tutor?.nome ?? 'Não informado',
      nome_animal: animal?.nome ?? 'Não informado',
      especie: animal?.raca?.especie?.nome ?? 'N/A',
      raca: animal?.raca?.nome ?? 'N/A',
      nome_veterinario: veterinario?.nome ?? 'Não informado',
      crmv_veterinario: veterinario?.crmv ?? 'N/A',
      data_consulta: new Date().toISOString(),
      ...(isPrescricao 
          ? { descricoes_prescricao: text.split('\n') } 
          : { solicitacoes_exame: text.split('\n') })
    };

    try {
      const response = await api.postAndGetBlob(endpoint, payload);
      const file = new Blob([response], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
      setPdfModalState({ isOpen: false, type: null }); // Fecha o modal
    } catch (error) {
      console.error(`Erro ao gerar PDF de ${type}:`, error);
      alert(`Não foi possível gerar o PDF de ${type}.`);
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
        />
      )}

         {/* ✅ COLE O CÓDIGO ABAIXO AQUI 
        Este bloco estava faltando. Ele renderiza o modal de PDF quando o estado muda.
      */}
      <PdfGeneratorModal
        isOpen={pdfModalState.isOpen}
        onClose={() => setPdfModalState({ isOpen: false, type: null })}
        onGeneratePdf={handleGeneratePdf}
        title={pdfModalState.type === 'prescricao' ? 'Gerar Prescrição' : 'Gerar Solicitação de Exame'}
        label={pdfModalState.type === 'prescricao' ? 'Prescrição' : 'Exames Solicitados'}
        initialText={formData[pdfModalState.type]}
      />
      
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.header}>
            <h2>Nova Consulta</h2>
            <button className={styles.closeButton} onClick={onClose}>&times;</button>
          </div>

          {loading && <p className={styles.loadingText}>Carregando...</p>}
          {error && <p className={styles.errorText}>{error}</p>}
          
          {!loading && !error && animal && (
            <>
              <div className={styles.animalHeader}>
                <div className={styles.animalInfo}>
                  <i className="fas fa-paw"></i>
                  <h3>{animal.nome}</h3>
                </div>
                <div className={styles.tutorInfo}>
                  <p><strong>Tutor:</strong> {animal.tutor.nome}</p>
                  <p><strong>CPF:</strong> {animal.tutor.cpf}</p>
                  <p><strong>Telefone:</strong> {animal.tutor.telefone}</p>
                </div>
                <div className={styles.animalActions}>
                  <button>Editar</button>
                  <button>Trocar Animal</button>
                  <button>Consultas Anteriores</button>
                </div>
              </div>

              <div className={styles.mainBody}>
                {/* Painel Esquerdo - Anamnese */}
                <div className={styles.leftPanel}>
                  <div className={styles.card}>
                    <h4>Última anamnese</h4>
                    <div className={styles.anamneseGrid}>
                      <div><label>Espécie</label><p>{animal.raca.especie.nome}</p></div>
                      <div><label>Raça</label><p>{animal.raca.nome}</p></div>
                      <div><label>Sexo</label><p>{animal.sexo === 'F' ? 'Fêmea' : 'Macho'}</p></div>
                      <div><label>Porte</label><p>{animal.porte}</p></div>
                      <div><label>Temperamento</label><p>{animal.temperamento}</p></div>
                      <div><label>Idade</label><p>{calculateAge(animal.data_nasc)}</p></div>
                      <div><label>Nascimento</label><p>{formatDate(animal.data_nasc)}</p></div>
                      <div><label>Castrado</label><p>{animal.castrado ? 'Sim' : 'Não'}</p></div>
                    </div>
                    <div className={styles.fullWidth}><label>Alergias</label><p>{animal.alergias || 'Nenhuma'}</p></div>
                    <div className={styles.fullWidth}><label>Observações</label><p>{animal.observacoes || 'Nenhuma'}</p></div>
                  </div>
                </div>

                {/* Painel Direito - Formulário */}
                <div className={styles.rightPanel}>
                  <div className={styles.vitalsGrid}>
                    <div><label>Peso</label><input type="text" name="peso" value={formData.peso} onChange={handleChange} /></div>
                    <div><label>Temperatura</label><input type="text" name="temperatura" value={formData.temperatura} onChange={handleChange} /></div>
                    <div><label>TPC</label><input type="text" name="tpc" value={formData.tpc} onChange={handleChange} /></div>
                    <div><label>Mucosas</label><input type="text" name="mucosas" value={formData.mucosas} onChange={handleChange} /></div>
                    <div><label>Frequência Cardíaca</label><input type="text" name="freqCardiaca" value={formData.freqCardiaca} onChange={handleChange} /></div>
                    <div><label>Frequência Respiratória</label><input type="text" name="freqResp" value={formData.freqResp} onChange={handleChange} /></div>
                  </div>
                  <div className={styles.formGroup}><label>Queixa principal</label><textarea name="queixaPrincipal" value={formData.queixaPrincipal} onChange={handleChange}></textarea></div>
                  <div className={styles.formGroup}><label>Suspeita Clínica</label><textarea name="suspeitaClinica" value={formData.suspeitaClinica} onChange={handleChange}></textarea></div>
                  <div className={styles.formGroup}><label>Diagnóstico</label><textarea name="diagnostico" value={formData.diagnostico} onChange={handleChange}></textarea></div>
                  <div className={styles.formGroup}><label>Tratamento</label><textarea name="tratamento" value={formData.tratamento} onChange={handleChange}></textarea></div>
                </div>
              </div>

              <div className={styles.footer}>
                <div className={styles.footerActions}>
                  <button className={styles.actionButton} onClick={() => handleOpenPdfModal('prescricao')}><i className="fas fa-file-prescription"></i> Prescrição</button>
                  <button className={styles.actionButton} onClick={() => handleOpenPdfModal('exame')}><i className="fas fa-vial"></i> Exames</button>
                  <button className={styles.actionButton} onClick={() => setIsVacinaModalOpen(true)}><i className="fas fa-syringe"></i> Vacinas</button>
                </div>
                <div className={styles.footerControls}>
                  <button className={styles.cancelButton} onClick={onClose}>Cancelar</button>
                  <button className={styles.saveButton} onClick={handleSaveConsulta}>Salvar</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default NovaConsultaModal;