// pages/Consulta/HistoryModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './HistoryModal.module.css';

// Função para formatar datas, pode ser movida para um arquivo de helpers
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(dateString));
};

function HistoryModal({ isOpen, onClose, animalId, type, onAddNew, onAddDose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && animalId && type) {
      setLoading(true);
      setError('');
      setHistory([]);

      const fetchHistory = async () => {
        try {
          let response;
          if (type === 'vacinas') {
            response = await api.getVacinasByAnimal(animalId);
          } else if (type === 'exames') {
            response = await api.getExamesByAnimal(animalId);
          } else if (type === 'prescricoes') {
            response = await api.getPrescricoesByAnimal(animalId);
          }
          setHistory(response || []);
        } catch (err) {
          setError(`Não foi possível carregar o histórico de ${type}.`);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, animalId, type]);

  const renderContent = () => {
    if (loading) return <p>Carregando histórico...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (history.length === 0) return <p>Nenhum registro anterior encontrado.</p>;

    switch (type) {
      case 'vacinas': { // ✅ Início do bloco
        // Agrupa as vacinas por nome base para exibir apenas a mais recente de cada tipo
        const groupedVaccines = history.reduce((acc, current) => {
          const name = current.nome.split(' (')[0];
          if (!acc[name] || new Date(current.data_aplic) > new Date(acc[name].data_aplic)) {
            acc[name] = current;
          }
          return acc;
        }, {});

        const latestVaccines = Object.values(groupedVaccines);

        return latestVaccines.map(item => (
          <div key={item.id_vacina} className={styles.historyItem}>
            <div className={styles.itemInfo}>
              <strong>{item.nome.split(' (')[0]}</strong>
              <span className={styles.doseInfo}>
                Última dose: {item.nome.match(/\(([^)]+)\)/)?.[1] || 'Não especificada'}
              </span>
              <span>Aplicada em: {formatDate(item.data_aplic)}</span>
            </div>
            <button
              className={styles.addDoseButton}
              onClick={() => onAddDose(item)}>
              Adicionar Dose
            </button>
          </div>
        ));
      } // ✅ Fim do bloco
      case 'exames':
        return history.map(item => (
          <div key={item.id_exame} className={styles.historyItem}>
            <p><strong>Solicitação:</strong> {item.solicitacao}</p>
            {item.resultado && <p><strong>Resultado:</strong> {item.resultado}</p>}
            <span>Data: {formatDate(item.consulta.data)}</span>
          </div>
        ));
      case 'prescricoes':
        return history.map(item => (
          <div key={item.id_prescricao} className={styles.historyItem}>
            <p>{item.descricao}</p>
            <span>Data: {formatDate(item.consulta.data)}</span>
          </div>
        ));
      default:
        return null;
    }
  };

  const titles = {
    vacinas: 'Histórico de Vacinas',
    exames: 'Histórico de Exames',
    prescricoes: 'Histórico de Prescrições',
  };

  const buttonLabels = {
    vacinas: 'Adicionar Nova Vacina',
    exames: 'Gerar Nova Solicitação',
    prescricoes: 'Gerar Nova Prescrição',
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{titles[type]}</h3>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.content}>
          {renderContent()}
        </div>
        <div className={styles.footer}>
          <button onClick={onAddNew} className={styles.addButton}>
            <i className="fas fa-plus"></i> {buttonLabels[type]}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HistoryModal;