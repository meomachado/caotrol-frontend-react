// src/pages/Agenda/AgendamentoDetailModal.jsx

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './AgendamentoModal.module.css'; // Reutilizando o mesmo estilo

function AgendamentoDetailModal({ isOpen, onClose, onSave, eventInfo }) {
  // Estado para guardar o status selecionado
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  // Efeito para preencher o status inicial quando o modal abre
  useEffect(() => {
    if (eventInfo) {
      // O 'extendedProps' contém os dados extras que enviamos do backend
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
      // ATENÇÃO: A lógica aqui depende das rotas do seu backend.
      // Este exemplo usa rotas PATCH específicas para confirmar e cancelar.
      if (status === 'confirmada') {
        await api.patch(`/agendamentos/${eventId}/confirmar`);
      } else if (status === 'cancelada') {
        await api.patch(`/agendamentos/${eventId}/cancelar`);
      } else {
        // Se seu backend tiver uma rota PUT/PATCH genérica para atualizar o status:
        // await api.put(`/agendamentos/${eventId}`, { status: status });
      }
      onSave(); // Avisa a página principal para recarregar o calendário
    } catch (err) {
      setError('Erro ao atualizar o status do agendamento.');
      console.error(err);
    }
  };

  // Formata a hora para exibição (ex: 09:00)
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo' // Use o fuso horário relevante
    }).format(new Date(date));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Detalhes do Agendamento</h2>
        <div className={styles.formBody}>
          <div className={styles.detailGroup}>
            <label>Animal</label>
            {/* O 'title' já contém o nome do animal e do tutor */}
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