import React, { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./AgendamentoModal.module.css";
import { FaQuestionCircle } from "react-icons/fa";
import HelpModal from "../Help/HelpModal";
import helpButtonStyles from "../Help/HelpButton.module.css"; 
import toast from 'react-hot-toast'; // Importante para avisar se o horário estiver ocupado

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

  // NOVO: Armazena o horário que veio do clique no calendário
  const [horarioPreSelecionado, setHorarioPreSelecionado] = useState(null);

  // Estados para a busca de Tutor
  const [tutorSearchTerm, setTutorSearchTerm] = useState("");
  const [searchedTutores, setSearchedTutores] = useState([]);
  const [showTutorResults, setShowTutorResults] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpContent, setHelpContent] = useState(null);
  const [helpLoading, setHelpLoading] = useState(false);

  // --- FUNÇÃO PARA ABRIR A AJUDA ---
  const handleOpenHelp = async () => {
    setHelpLoading(true);
    try {
      const data = await api.getHelpContent('agendamento-novo'); 
      setHelpContent(data);
      setIsHelpModalOpen(true);
    } catch (err) {
      console.error("Erro ao buscar ajuda:", err);
      setError("Não foi possível carregar o tópico de ajuda.");
    } finally {
      setHelpLoading(false);
    }
  };
  
  // Efeito para resetar e configurar dados iniciais
  useEffect(() => {
    if (isOpen) {
      // 1. Limpa estados antigos
      setIdTutor("");
      setIdAnimal("");
      setIdVeterinario("");
      setHorario("");
      setError("");
      setTutorSearchTerm("");
      setSearchedTutores([]);
      setAnimais([]);
      setHorarios([]);
      setHorarioPreSelecionado(null);
      
      // 2. Lógica para extrair Data e Hora do clique no calendário
      if (selectedDate) {
        // Se tem 'T' (ex: 2026-01-30T14:00:00), é clique na visão semanal (hora específica)
        if (selectedDate.includes('T')) {
            const [datePart, timePart] = selectedDate.split('T');
            setDia(datePart);
            
            // Pega as primeiras 5 letras (HH:mm)
            const horaCapturada = timePart.substring(0, 5);
            setHorarioPreSelecionado(horaCapturada);

            // TRUQUE VISUAL: Já preenchemos a lista e o valor para o usuário ver "11:00"
            // mesmo antes de escolher o veterinário.
            setHorarios([horaCapturada]); 
            setHorario(horaCapturada); 

        } else {
            // Visão mensal (só data), reseta hora
            setDia(selectedDate);
            setHorario("");
            setHorarios([]);
        }
      } else {
        // Botão "Novo Agendamento" (sem data)
        setDia(new Date().toISOString().split('T')[0]);
        setHorarios([]);
      }

      // 3. Busca lista de veterinários
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
  
  // Busca horários REAIS quando Veterinário e Dia mudam
  useEffect(() => {
    if (idVeterinario && dia) {
      api.get(`/agendamentos/horarios-disponiveis?id_veterinario=${idVeterinario}&dia=${dia}`)
        .then((res) => {
            const slotsDisponiveis = Array.isArray(res) ? res : [];
            
            // Verifica se o horário pré-selecionado (ex: 11:00) está realmente livre para este vet
            if (horarioPreSelecionado) {
                // Normaliza para garantir comparação (caso a API mande 11:00:00)
                const horarioExiste = slotsDisponiveis.some(h => h.startsWith(horarioPreSelecionado));
                
                if (horarioExiste) {
                    // Se existe, mantemos ele selecionado e atualizamos a lista completa
                    setHorarios(slotsDisponiveis);
                    setHorario(horarioPreSelecionado);
                } else {
                    // Se NÃO existe (vet ocupado), limpamos e avisamos
                    setHorarios(slotsDisponiveis);
                    setHorario(""); 
                    toast.error(`O horário ${horarioPreSelecionado} está ocupado para este veterinário.`);
                }
            } else {
                // Se não tinha pré-seleção, apenas carrega a lista
                setHorarios(slotsDisponiveis);
            }
        })
        .catch(() => {
            setHorarios([]);
            setHorario("");
        });
    } 
    // Nota: Se não tiver idVeterinario, não limpamos 'horarios' imediatamente 
    // para manter o "Truque Visual" (passo 2 do useEffect anterior) ativo até o usuário escolher.
  }, [idVeterinario, dia, horarioPreSelecionado]);

  // Busca de tutores (Autocomplete)
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
      toast.success("Agendamento criado com sucesso!");
    } catch (err) {
      setError(err.message || "Erro ao criar agendamento.");
    }
  };
  
  if (!isOpen) return null;

  return (
    <> 
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

            {/* Campo de seleção para Animal */}
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
                    {/* Alterado: Habilitamos o campo se houver horário pré-selecionado para mostrar o valor */}
                    <select 
                      value={horario} 
                      onChange={(e) => setHorario(e.target.value)} 
                      disabled={(!idVeterinario || !dia) && !horarioPreSelecionado}
                    >
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