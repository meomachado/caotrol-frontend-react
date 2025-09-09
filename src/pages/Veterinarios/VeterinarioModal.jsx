// pages/Veterinarios/VeterinarioModal.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import styles from './VeterinarioModal.module.css'; // Reutilizaremos o estilo do modal de usuário

function VeterinarioModal({ isOpen, onClose, onSave }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [crmv, setCrmv] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.createVeterinario({ nome, cpf, crmv });
      onSave();
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar veterinário.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Novo Perfil de Veterinário</h2>
        <form id="vet-form" onSubmit={handleSubmit} className={styles.formBody}>
          <div className={styles.formGroup}>
            <label>Nome Completo</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>CRMV</label>
            <input type="text" value={crmv} onChange={e => setCrmv(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>CPF</label>
            <input type="text" value={cpf} onChange={e => setCpf(e.target.value)} required />
          </div>
        
        </form>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
          <button type="submit" form="vet-form" className={styles.saveButton} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VeterinarioModal;