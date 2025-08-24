// src/pages/Agenda/AgendamentoDetailModal.jsx

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './AgendamentoModal.module.css'; // Reutilizando o mesmo estilo

// ✅ Adicione a nova prop `onStartConsulta`
function AgendamentoDetailModal({ isOpen, onClose, onSave, eventInfo, onStartConsulta }) {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventInfo) {
      setStatus(eventInfo.extendedProps.status || 'pendente');
    }
  }, [eventInfo]);

  if (!isOpen || !eventInfo) {
    return null;
  }
  const handleStatusChange = async () => {
    setError('');
    const eventId = eventInfo.id;
  
    try {
      if (status === 'confirmada') {
        await api.patch(`/agendamentos/${eventId}/confirmar`);
      } else if (status === 'cancelada') {
        await api.patch(`/agendamentos/${eventId}/cancelar`);
      }
      
      onSave();
    } catch (err) {
      setError(err.message || 'Erro ao atualizar o status do agendamento.');
      console.error(err);
    }
  };
  
  // Formata a hora para exibição (ex: 09:00)
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }).format(new Date(date));
  };
  
  // ✅ Handler para o novo botão
  const handleStartConsultationClick = () => {
    // Chama a função passada pelo componente pai (Agenda.jsx)
    const idAnimal = eventInfo.extendedProps.id_animal; 
    onStartConsulta(idAnimal);
  };
  
  const isConsultationStarted = eventInfo.extendedProps.realizada;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Detalhes do Agendamento</h2>
        <div className={styles.formBody}>
          <div className={styles.detailGroup}>
            <label>Animal</label>
            <p>{eventInfo.title}</p>
          </div>
          <div className={styles.detailGroup}>
            <label>Horário</label>
            <p>{formatTime(eventInfo.start)}</p>
          </div>
          <div className={styles.detailGroup}>
            <label>Veterinário</label>
            <p>{eventInfo.extendedProps.veterinario}</p>
          </div>
          <div className={styles.formGroup}>
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pendente">Pendente</option>
              <option value="agendada">Agendada</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.modalActions}>
          <button 
            type="button" 
            onClick={handleStartConsultationClick} 
            className={styles.saveButton}
            disabled={isConsultationStarted} // ✅ Desabilita se a consulta já foi iniciada
            >
              Iniciar Consulta
          </button>
          
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Fechar
          </button>
          <button type="button" onClick={handleStatusChange} className={styles.saveButton}>
            Salvar Status
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgendamentoDetailModal;