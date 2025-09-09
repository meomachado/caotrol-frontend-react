// pages/Animais/ResultadoExameModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './ResultadoExameModal.module.css'; // Reutilizaremos um estilo existente

function ResultadoExameModal({ isOpen, onClose, onSave, exame }) {
  const [resultado, setResultado] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Preenche o campo com o resultado existente quando o modal abre
    if (exame) {
      setResultado(exame.resultado || '');
    }
  }, [exame]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resultado.trim()) {
      setError('O campo de resultado é obrigatório.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // O corpo da requisição precisa ter o campo 'resultado'
      const payload = { resultado: resultado };
      await api.updateExame(exame.id_exame, payload);
      onSave(); // Avisa o componente pai que salvou com sucesso
    } catch (err) {
      setError(err.message || 'Erro ao salvar o resultado do exame.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Resultado do Exame</h2>
        <form onSubmit={handleSubmit} className={styles.formBody}>
          <div className={styles.formGroup}>
            <label>Solicitação</label>
            <p className={styles.readOnlyInfo}>{exame?.solicitacao || 'N/A'}</p>
          </div>
          <div className={styles.formGroup}>
            <label>Resultado</label>
            <textarea
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
              rows="8"
              required
            />
          </div>
        </form>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
          <button type="submit" onClick={handleSubmit} className={styles.saveButton} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Resultado'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultadoExameModal;