// src/pages/Tutores/TutorDetailModal.jsx
import React from 'react';
import styles from './TutorDetailModal.module.css'; // Usaremos um novo CSS

function TutorDetailModal({ isOpen, onClose, tutor }) {
  if (!isOpen || !tutor) {
    return null;
  }

  // --- Funções de Formatação ---
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
  };

  const formatCPF = (value) => {
    if (!value) return '—';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatTelefone = (value) => {
    if (!value) return '—';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };
  
  const formatAddress = () => {
    const parts = [tutor.logradouro, tutor.num, tutor.bairro].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '—';
  };
  
  const formatCityState = () => {
    if (tutor.cidade?.nome && tutor.cidade?.estado?.uf) {
      return `${tutor.cidade.nome} - ${tutor.cidade.estado.uf}`;
    }
    return '—';
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.modalHeader}>
          <h2>Detalhes do Tutor</h2>
        </div>

        <div className={styles.modalBody}>
          {/* PAINEL ESQUERDO */}
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Dados Pessoais</h3>
              <div className={styles.detailGroup}>
                <label>Nome Completo</label>
                <div className={styles.detailField}><i className="fas fa-user"></i><span>{tutor.nome || '—'}</span></div>
              </div>
              <div className={styles.detailGroup}>
                <label>CPF</label>
                <div className={styles.detailField}><i className="fas fa-id-card"></i><span>{formatCPF(tutor.cpf)}</span></div>
              </div>
              <div className={styles.detailGroup}>
                <label>Telefone</label>
                <div className={styles.detailField}><i className="fas fa-phone"></i><span>{formatTelefone(tutor.telefone)}</span></div>
              </div>
              <div className={styles.detailGroup}>
                <label>Data de Nascimento</label>
                <div className={styles.detailField}><i className="fas fa-calendar-alt"></i><span>{formatDate(tutor.data_nasc)}</span></div>
              </div>
            </div>
          </div>
          
          {/* PAINEL DIREITO */}
          <div className={styles.panel}>
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Endereço</h3>
                <div className={styles.detailGroup}>
                    <label>CEP</label>
                    <div className={styles.detailField}><i className="fas fa-map-marker-alt"></i><span>{tutor.cep || '—'}</span></div>
                </div>
                 <div className={styles.detailGroup}>
                    <label>Cidade / Estado</label>
                    <div className={styles.detailField}><span>{formatCityState()}</span></div>
                </div>
                <div className={styles.detailGroup}>
                    <label>Logradouro</label>
                    <div className={styles.detailField}><span>{formatAddress()}</span></div>
                </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>
            <i className="fas fa-times"></i> Fechar
          </button>
        </div>

      </div>
    </div>
  );
}

export default TutorDetailModal;