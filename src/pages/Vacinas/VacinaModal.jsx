// pages/Vacinas/VacinaModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './VacinaModal.module.css';

function VacinaModal({ isOpen, onClose, onSave, animalId, initialData }) {
  const [nome, setNome] = useState('');
  const [dose, setDose] = useState('');
  const [dataAplic, setDataAplic] = useState(new Date().toISOString().split('T')[0]);
  const [dataProx, setDataProx] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && animalId) {
      if (initialData?.nome) {
        // Extrai o nome base da vacina, ex: "V10" de "V10 (1ª dose)"
        const nomeBase = initialData.nome.split(' (')[0];
        
        // Busca o histórico para sugerir a próxima dose
        api.getVacinasByAnimal(animalId).then(historico => {
            const dosesAnteriores = historico.filter(v => v.nome.startsWith(nomeBase)).length;
            setNome(nomeBase);
            setDose(`${dosesAnteriores + 1}ª dose`);
        });

      } else {
        setNome('');
        setDose('1ª dose');
      }
      // Reseta os outros campos
      setDataAplic(new Date().toISOString().split('T')[0]);
      setDataProx('');
      setError('');
    }
  }, [isOpen, animalId, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !dataAplic) {
      setError('O nome e a data de aplicação são obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Concatena o nome da vacina com a dose se a dose estiver preenchida
      const nomeCompleto = dose ? `${nome} (${dose})` : nome;

      const vacinaData = {
        nome: nomeCompleto,
        data_aplic: new Date(dataAplic).toISOString(),
        data_prox: dataProx ? new Date(dataProx).toISOString() : null,
      };
      
      await api.post(`/animais/${animalId}/vacinas`, vacinaData);
      onSave();
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
            <label>Dose</label>
            <input type="text" value={dose} onChange={(e) => setDose(e.target.value)} placeholder="Ex: 1ª dose, Reforço anual" />
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