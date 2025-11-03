import React, { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./AgendamentoModal.module.css";
import { FaQuestionCircle } from "react-icons/fa";
import HelpModal from "../Help/HelpModal";
import helpButtonStyles from "../Help/HelpButton.module.css"; 
function AgendamentoModal({ isOpen, onClose, onSave, selectedDate }) {
  // Estados para listas de dados
  const [animais, setAnimais] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [horarios, setHorarios] = useState([]);

  // Estados dos valores do formulário
  const [idTutor, setIdTutor] = useState("");
  const [idAnimal, setIdAnimal] = useState("");
  const [idVeterinario, setIdVeterinario] = useState("");
  const [dia, setDia] = useState("");
  const [horario, setHorario] = useState("");
  const [error, setError] = useState("");

  // Estados para a busca de Tutor
  const [tutorSearchTerm, setTutorSearchTerm] = useState("");
  const [searchedTutores, setSearchedTutores] = useState([]);
  const [showTutorResults, setShowTutorResults] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpContent, setHelpContent] = useState(null);
  const [helpLoading, setHelpLoading] = useState(false);
  // ------------------------------------

  // ... (seus 'useEffect' e 'handleSubmit') ...

  // --- FUNÇÃO PARA ABRIR A AJUDA ---
  const handleOpenHelp = async () => {
    setHelpLoading(true);
    try {
      // Usando a "pageKey" correta
      const data = await api.getHelpContent('agendamento-novo'); 
      setHelpContent(data);
      setIsHelpModalOpen(true);
    } catch (err) {
      console.error("Erro ao buscar ajuda:", err);
      // Podemos usar o 'setError' do próprio modal
      setError("Não foi possível carregar o tópico de ajuda.");
    } finally {
      setHelpLoading(false);
    }
  };
  
  // Efeito para buscar veterinários e resetar o estado do modal
  useEffect(() => {
    if (isOpen) {
      // Limpa estados antigos ao abrir
      setIdTutor("");
      setIdAnimal("");
      setIdVeterinario("");
      setHorario("");
      setError("");
      setTutorSearchTerm("");
      setSearchedTutores([]);
      setAnimais([]);
      setHorarios([]);
      
      // Define a data e busca a lista de veterinários
      setDia(selectedDate ? selectedDate.split('T')[0] : new Date().toISOString().split('T')[0]);
      api.get("/veterinarios?limit=1000").then((res) => setVeterinarios(Array.isArray(res.data) ? res.data : []));
    }
  }, [isOpen, selectedDate]);

  // Busca animais quando um tutor é selecionado
  useEffect(() => {
    if (idTutor) {
      api.get(`/tutores/${idTutor}/animais`).then((res) => setAnimais(Array.isArray(res) ? res : []));
    } else {
      setAnimais([]);
    }
  }, [idTutor]);
  
  // Busca horários quando um veterinário e um dia são selecionados
  useEffect(() => {
    if (idVeterinario && dia) {
      api.get(`/agendamentos/horarios-disponiveis?id_veterinario=${idVeterinario}&dia=${dia}`)
        .then((res) => setHorarios(Array.isArray(res) ? res : []));
    } else {
      setHorarios([]);
    }
  }, [idVeterinario, dia]);

  // Efeito com debounce para buscar tutores
  useEffect(() => {
    if (tutorSearchTerm.length < 2) {
      setSearchedTutores([]);
      setShowTutorResults(false);
      return;
    }
    const timer = setTimeout(() => {
      api.searchTutores(tutorSearchTerm).then(res => {
        setSearchedTutores(Array.isArray(res) ? res : []);
        setShowTutorResults(true);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [tutorSearchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idTutor || !idAnimal || !idVeterinario || !dia || !horario) {
      setError("Todos os campos são obrigatórios.");
      return;
    }
    const id_usuario = localStorage.getItem("user_id");

    try {
      const agendamentoData = {
        id_tutor: parseInt(idTutor),
        id_animal: parseInt(idAnimal),
        id_veterinario: parseInt(idVeterinario),
        dia,
        horario,
        id_usuario: parseInt(id_usuario),
      };
      await api.createAgendamento(agendamentoData);
      onSave();
    } catch (err) {
      setError(err.message || "Erro ao criar agendamento.");
    }
  };
  
  if (!isOpen) return null;

  return (
    <> {/* Adicionado Fragment */}
      {/* O Modal de Ajuda fica aqui */}
      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        content={helpContent}
      />
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              Novo Agendamento
              <button 
                className={helpButtonStyles.helpIcon} 
                onClick={handleOpenHelp}
                disabled={helpLoading}
                title="Ajuda sobre este formulário"
              >
                <FaQuestionCircle />
              </button>
            </h2>
        </div>
        
        <form id="agendamento-form" onSubmit={handleSubmit} className={styles.formBody}>
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Informações do Agendamento</h3>
            
            {/* Campo de busca para Tutor */}
            <div className={styles.formGroup}>
              <label>Tutor</label>
              <input
                type="text"
                placeholder="Digite para buscar o tutor..."
                value={tutorSearchTerm}
                onChange={(e) => {
                  setTutorSearchTerm(e.target.value);
                  setIdTutor("");
                  setIdAnimal("");
                }}
                onFocus={() => setShowTutorResults(true)}
                onBlur={() => setTimeout(() => setShowTutorResults(false), 200)}
              />
              {showTutorResults && searchedTutores.length > 0 && (
                <ul className={styles.autocompleteList}>
                  {searchedTutores.map((tutor) => (
                    <li key={tutor.id_tutor} onMouseDown={() => {
                      setIdTutor(tutor.id_tutor);
                      setTutorSearchTerm(`${tutor.nome} - ${tutor.cpf}`);
                      setShowTutorResults(false);
                    }}>
                      {tutor.nome} - {tutor.cpf}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Campo de seleção para Animal (depende do Tutor) */}
            <div className={styles.formGroup}>
              <label>Animal</label>
              <select value={idAnimal} onChange={(e) => setIdAnimal(e.target.value)} disabled={!idTutor}>
                <option value="">Selecione um animal</option>
                {animais.map((animal) => (
                  <option key={animal.id_animal} value={animal.id_animal}>
                    {animal.nome}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Campo de seleção para Veterinário */}
            <div className={styles.formGroup}>
              <label>Veterinário</label>
              <select value={idVeterinario} onChange={(e) => setIdVeterinario(e.target.value)}>
                <option value="">Selecione um veterinário</option>
                {veterinarios.map((vet) => (
                  <option key={vet.id_veterinario} value={vet.id_veterinario}>
                    {vet.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Agrupamento de Dia e Horário */}
            <div className={styles.gridGroup}>
                <div className={styles.formGroup}>
                    <label>Dia</label>
                    <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                    <label>Horário</label>
                    <select value={horario} onChange={(e) => setHorario(e.target.value)} disabled={!idVeterinario || !dia}>
                        <option value="">Selecione um horário</option>
                        {horarios.map((h) => (<option key={h} value={h}>{h}</option>))}
                    </select>
                </div>
            </div>
          </div>
        </form>
        
        <div className={styles.modalFooter}>
          <div className={styles.errorContainer}>
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>Cancelar</button>
            <button type="submit" form="agendamento-form" className={`${styles.btn} ${styles.btnSave}`}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default AgendamentoModal;