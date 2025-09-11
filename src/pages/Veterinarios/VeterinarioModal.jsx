// VeterinarioModal.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
// IMPORTANTE: Agora usa o CSS compartilhado
import styles from '../Usuarios/SharedModal.module.css';

function VeterinarioModal({ isOpen, onClose, onSave, initialData }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [crmv, setCrmv] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setNome(initialData.nome || '');
        setCpf(initialData.cpf || '');
        setCrmv(initialData.crmv || '');
      } else {
        setNome('');
        setCpf('');
        setCrmv('');
      }
      setError('');
    }
  }, [isOpen, initialData, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { nome, cpf, crmv };
      if (isEditing) {
        await api.updateVeterinario(initialData.id_veterinario, payload);
      } else {
        await api.createVeterinario(payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{isEditing ? 'Editar Perfil de Veterinário' : 'Novo Perfil de Veterinário'}</h2>
        </div>
        <form id="vet-form" onSubmit={handleSubmit} className={styles.formBody}>
          {/* Painel Esquerdo */}
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>
                <i className="fas fa-user-md"></i>
                Dados Profissionais
              </h3>
              <div className={styles.formGroup}>
                <label>Nome Completo</label>
                <div className={styles.inputIconWrapper}>
                   <i className="fas fa-user"></i>
                   <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
                </div>
              </div>
            </div>
          </div>
          {/* Painel Direito */}
          <div className={styles.panel}>
             <div className={styles.card}>
               <h3 className={styles.sectionTitle}>
                  <i className="fas fa-id-card"></i>
                  Identificação
               </h3>
               <div className={styles.formGroup}>
                  <label>CRMV</label>
                  <div className={styles.inputIconWrapper}>
                    <i className="fas fa-paw"></i>
                    <input type="text" value={crmv} onChange={e => setCrmv(e.target.value)} required />
                  </div>
               </div>
               <div className={styles.formGroup}>
                  <label>CPF</label>
                  <div className={styles.inputIconWrapper}>
                    <i className="fas fa-id-card"></i>
                    <input type="text" value={cpf} onChange={e => setCpf(e.target.value)} required placeholder="000.000.000-00" />
                  </div>
               </div>
             </div>
          </div>
        </form>
        <div className={styles.modalFooter}>
            <div className={styles.errorContainer}>
                {error && <p className={styles.errorMessage}>{error}</p>}
            </div>
            <div className={styles.buttonGroup}>
                <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>
                    <i className="fas fa-times"></i> Cancelar
                </button>
                <button type="submit" form="vet-form" className={`${styles.btn} ${styles.btnSave}`} disabled={loading}>
                    <i className="fas fa-check"></i> {loading ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default VeterinarioModal;