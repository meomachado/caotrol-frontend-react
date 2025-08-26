// src/pages/Tutores/TutorDetailModal.jsx
import React from 'react';
import styles from './TutorDetailModal.module.css';

function TutorDetailModal({ isOpen, onClose, tutor }) {
  if (!isOpen || !tutor) {
    return null;
  }

  // Função para formatar a data para o padrão brasileiro (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    // Adiciona timeZone: 'UTC' para evitar problemas de fuso horário
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
  };

  // Formata o endereço de forma mais robusta, lidando com campos vazios
  const formatAddress = () => {
    const parts = [];
    if (tutor.rua) parts.push(tutor.rua);
    if (tutor.num) parts.push(tutor.num);
    if (tutor.bairro) parts.push(tutor.bairro);
    
    return parts.length > 0 ? parts.join(', ') : 'Não informado';
  };
  
  // O backend precisa incluir a relação `cidade` com `estado` no findById do tutor
  const formatCityState = () => {
    const city = tutor.cidade?.nome || tutor.cidade || 'Não informado';
    const state = tutor.cidade?.estado?.uf || '';
    return state ? `${city} - ${state}` : city;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.modalHeader}>
          <h2>Detalhes do Tutor</h2>
        </div>

        <div className={styles.modalBody}>
          <h3 className={styles.sectionTitle}>Informações Pessoais</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailGroup}>
              <label>Nome Completo</label>
              <p>{tutor.nome || 'Não informado'}</p>
            </div>
            <div className={styles.detailGroup}>
              <label>CPF</label>
              <p>{tutor.cpf || 'Não informado'}</p>
            </div>
            <div className={styles.detailGroup}>
              <label>Telefone</label>
              <p>{tutor.telefone || 'Não informado'}</p>
            </div>
            <div className={styles.detailGroup}>
              <label>Data de Nascimento</label>
              <p>{formatDate(tutor.data_nasc)}</p>
            </div>
          </div>

          <h3 className={styles.sectionTitle} style={{ marginTop: '30px' }}>Endereço</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailGroup}>
              <label>Logradouro</label>
              <p>{formatAddress()}</p>
            </div>
            <div className={styles.detailGroup}>
              <label>CEP</label>
              <p>{tutor.cep || 'Não informado'}</p>
            </div>
            <div className={styles.detailGroup}>
              <label>Cidade / Estado</label>
              <p>{formatCityState()}</p>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeButton}>
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}

export default TutorDetailModal;
