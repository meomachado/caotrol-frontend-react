// pages/Vacinas/VacinaModal.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import styles from './VacinaModal.module.css';

function VacinaModal({ isOpen, onClose, onSave, animalId }) {
  const [nome, setNome] = useState('');
  const [dataAplic, setDataAplic] = useState(new Date().toISOString().split('T')[0]);
  const [dataProx, setDataProx] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !dataAplic) {
      setError('O nome e a data de aplicação são obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const vacinaData = {
        nome,
        data_aplic: new Date(dataAplic).toISOString(),
        data_prox: dataProx ? new Date(dataProx).toISOString() : null,
      };
      // A API está pronta para receber o POST nesta rota
      await api.post(`/animais/${animalId}/vacinas`, vacinaData);
      onSave(); // Avisa o componente pai que a vacina foi salva com sucesso
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar a vacina.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Registrar Vacina</h2>
        <form onSubmit={handleSubmit} className={styles.formBody}>
          <div className={styles.formGroup}>
            <label>Nome da Vacina</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Data da Aplicação</label>
            <input type="date" value={dataAplic} onChange={(e) => setDataAplic(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Próxima Dose (Opcional)</label>
            <input type="date" value={dataProx} onChange={(e) => setDataProx(e.target.value)} />
          </div>
        </form>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
          <button type="submit" onClick={handleSubmit} className={styles.saveButton} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VacinaModal;