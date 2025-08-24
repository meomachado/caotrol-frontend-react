// src/pages/Consultas/ConsultaModal.jsx

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './ConsultaModal.module.css';

const initialState = {
  queixa: '',
  diagnostico: '',
  tratamento: '',
  peso: '',
  temperatura: '',
  tpc: '',
  mucosas: '',
  freq: '',
  resp: '',
};

function ConsultaModal({ isOpen, onClose, onSave, consultaToEdit }) {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (consultaToEdit) {
      // ✅ 3. ATUALIZE O ESTADO GARANTINDO QUE TODOS OS CAMPOS EXISTAM
      setFormData({
        queixa: consultaToEdit.queixa || '',
        diagnostico: consultaToEdit.diagnostico || '',
        tratamento: consultaToEdit.tratamento || '',
        peso: consultaToEdit.peso || '',
        temperatura: consultaToEdit.temperatura || '',
        tpc: consultaToEdit.tpc || '',
        mucosas: consultaToEdit.mucosas || '',
        freq: consultaToEdit.freq || '',
        resp: consultaToEdit.resp || '',
      });
    }
  }, [consultaToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put(`/consultas/${consultaToEdit.id_consulta}`, formData);
      onSave();
    } catch (err) {
      setError(err.message || 'Erro ao salvar as alterações.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          
          <div className={styles.modalHeader}>
            <div>
              <h2>Editar Consulta</h2>
              <div className={styles.headerMeta}>
                <span><strong>Animal:</strong> {consultaToEdit.animal?.nome || 'N/A'}</span>
                <span><strong>Tutor:</strong> {consultaToEdit.animal?.tutor?.nome || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className={styles.modalBody}>
            {/* PAINEL ESQUERDO - DADOS VITAIS E QUEIXA */}
            <div className={styles.leftPanel}>
              <div className={styles.vitalsGrid}>
                <div className={styles.formGroup}><label>Peso</label><input type="text" name="peso" value={formData.peso} onChange={handleChange} /></div>
                <div className={styles.formGroup}><label>Temperatura</label><input type="text" name="temperatura" value={formData.temperatura} onChange={handleChange} /></div>
                <div className={styles.formGroup}><label>TPC</label><input type="text" name="tpc" value={formData.tpc} onChange={handleChange} /></div>
                <div className={styles.formGroup}><label>Mucosas</label><input type="text" name="mucosas" value={formData.mucosas} onChange={handleChange} /></div>
                <div className={styles.formGroup}><label>Freq. Cardíaca</label><input type="text" name="freq" value={formData.freq} onChange={handleChange} /></div>
                <div className={styles.formGroup}><label>Freq. Respiratória</label><input type="text" name="resp" value={formData.resp} onChange={handleChange} /></div>
              </div>
              <div className={styles.formGroup}>
                <label>Queixa Principal</label>
                <textarea name="queixa" value={formData.queixa} onChange={handleChange}></textarea>
              </div>
            </div>

            {/* PAINEL DIREITO - DIAGNÓSTICO E TRATAMENTO */}
            <div className={styles.rightPanel}>
              <div className={styles.formGroup}>
                <label>Diagnóstico</label>
                <textarea name="diagnostico" value={formData.diagnostico} onChange={handleChange}></textarea>
              </div>
              <div className={styles.formGroup}>
                <label>Tratamento</label>
                <textarea name="tratamento" value={formData.tratamento} onChange={handleChange}></textarea>
              </div>
            </div>
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <div className={styles.modalFooter}>
            <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={onClose}>Cancelar</button>
            <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ConsultaModal;