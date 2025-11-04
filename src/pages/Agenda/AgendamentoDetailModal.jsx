import React, { useState } from "react";
import api from "../../services/api";
import styles from "./AgendamentoModal.module.css";
import toast from 'react-hot-toast';

const getStatusInfo = (status, isRealizada) => {
  if (isRealizada) return { text: 'Finalizada', color: '#6c757d' };
  switch (status) {
    case 'confirmada': return { text: 'Confirmada', color: '#28a745' };
    case 'agendada': return { text: 'Agendada', color: '#007bff' };
    case 'pendente': return { text: 'Pendente', color: '#ffc107' };
    case 'nao_compareceu': return { text: 'Não Compareceu', color: '#dc3545' };
    case 'cancelada': return { text: 'Cancelada', color: '#6c757d' };
    default: return { text: 'Indefinido', color: '#ccc' };
  }
};

function AgendamentoDetailModal({
  isOpen,
  onClose,
  onSave,
  eventInfo,
  onStartConsulta,
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !eventInfo) {
    return null;
  }

  const handleAction = async (action) => {
    setError("");
    setIsSubmitting(true);
    const eventId = eventInfo.id;
    try {
      await api[action](eventId);
      onSave();
    } catch (err) {
      setError(err.message || `Erro ao executar a ação.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartConsultationClick = () => {
    const userType = localStorage.getItem('user_type');
    if (userType !== 'veterinario') {
      toast.error('Acesso negado. Apenas veterinários podem iniciar uma consulta.');
      return;
    }
    const idAnimal = eventInfo.extendedProps.id_animal;
    const idAgendamento = eventInfo.id;
    onStartConsulta(idAnimal, idAgendamento);
  };

  const formatTime = (date) => new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo"
  }).format(new Date(date));

  const initialStatus = eventInfo.extendedProps.status;
  const isConsultationStarted = eventInfo.extendedProps.realizada;
  const statusInfo = getStatusInfo(initialStatus, isConsultationStarted);
  const isPastAppointment = new Date(eventInfo.start) < new Date();
  
  const canConfirm = !isConsultationStarted && ['pendente', 'agendada'].includes(initialStatus);
  const canCancel = !isConsultationStarted && ['pendente', 'agendada', 'confirmada'].includes(initialStatus);
  const canMarkAbsence = !isConsultationStarted && isPastAppointment && ['pendente', 'agendada', 'confirmada'].includes(initialStatus);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
            <h2>Detalhes do Agendamento</h2>
        </div>
        
        <div className={styles.formBody}>
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Detalhes</h3>
            <div className={styles.detailGroup}><label>Animal</label><p>{eventInfo.title}</p></div>
            <div className={styles.detailGroup}><label>Horário</label><p>{formatTime(eventInfo.start)}</p></div>
            <div className={styles.detailGroup}><label>Veterinário</label><p>{eventInfo.extendedProps.veterinario}</p></div>
            <div className={styles.detailGroup}>
              <label>Status</label>
              <div className={styles.statusDisplay}>
                <span className={styles.statusBadge} style={{ backgroundColor: statusInfo.color }}>
                  {statusInfo.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.errorContainer}>
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
          <div className={styles.buttonGroup}>
            <button onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>Fechar</button>
            
            {canConfirm && <button onClick={() => handleAction('confirmarAgendamento')} className={`${styles.btn} ${styles.btnSave}`} disabled={isSubmitting}>Confirmar</button>}
            
            {canMarkAbsence && <button onClick={() => handleAction('marcarFaltaAgendamento')} className={`${styles.btn} ${styles.btnAbsence}`} disabled={isSubmitting}>Marcar Falta</button>}
            
            <button onClick={handleStartConsultationClick} className={`${styles.btn} ${styles.btnStart}`} disabled={isSubmitting || isConsultationStarted}>
              {isConsultationStarted ? 'Consulta Realizada' : 'Iniciar Consulta'}
            </button>
            
            {canCancel && <button onClick={() => handleAction('cancelarAgendamento')} className={`${styles.btn} ${styles.btnDanger}`} disabled={isSubmitting}>Cancelar Agendamento</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgendamentoDetailModal;