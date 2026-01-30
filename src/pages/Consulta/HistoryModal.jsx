// pages/Consulta/HistoryModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './HistoryModal.module.css';
import { 
  FaCalendarAlt, 
  FaUserMd, 
  FaChevronDown, 
  FaPills, 
  FaCircle,
  FaSyringe,
  FaFileMedicalAlt
} from 'react-icons/fa';

// Função auxiliar para formatar datas
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(dateString));
};

function HistoryModal({ isOpen, onClose, animalId, type, onAddNew, onAddDose, refreshTrigger }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para controlar qual item do accordion está aberto (apenas para Prescrições)
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (isOpen && animalId && type) {
      setLoading(true);
      setError('');
      setHistory([]);
      setExpandedId(null); // Reseta o accordion ao abrir

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
  }, [isOpen, animalId, type, refreshTrigger]);

  // Função para alternar o accordion
  const toggleAccordion = (id) => {
    if (expandedId === id) {
      setExpandedId(null); // Fecha se já estiver aberto
    } else {
      setExpandedId(id); // Abre o novo e fecha os outros
    }
  };

  const renderContent = () => {
    if (loading) return <p style={{textAlign: 'center', padding: '20px'}}>Carregando histórico...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (history.length === 0) return <p style={{textAlign: 'center', padding: '20px', color: '#7f8c8d'}}>Nenhum registro anterior encontrado.</p>;

    switch (type) {
      case 'vacinas': {
       // Lógica de agrupamento de vacinas (mantida igual)
       const groupedVaccines = history.reduce((acc, current) => {
          const name = current.nome.split(' (')[0];
          const existing = acc[name];
          if (!existing || new Date(current.data_aplic) > new Date(existing.data_aplic) || (new Date(current.data_aplic).getTime() === new Date(existing.data_aplic).getTime() && current.id_vacina > existing.id_vacina)) {
            acc[name] = current;
          }
          return acc;
        }, {});
        const latestVaccines = Object.values(groupedVaccines);

        return latestVaccines.map(item => (
          <div key={item.id_vacina} className={styles.historyItem} style={{borderLeftColor: '#27ae60'}}>
            <div className={styles.itemInfo}>
              <strong style={{fontSize: '1.1rem', color: '#2c3e50'}}>{item.nome.split(' (')[0]}</strong>
              <div style={{marginTop: '5px', fontSize: '0.9rem', color: '#555'}}>
                 <span style={{marginRight: '15px'}}>Dose: <strong>{item.nome.match(/\(([^)]+)\)/)?.[1] || 'Única'}</strong></span>
                 <span>Data: <strong>{formatDate(item.data_aplic)}</strong></span>
              </div>
            </div>
            <button className={styles.addDoseButton} onClick={() => onAddDose(item)}>
              <FaSyringe /> Adicionar Dose
            </button>
          </div>
        ));
      }

   case 'exames':
        return history.map(item => (
          <div key={item.id_exame} className={styles.historyItem} style={{borderLeftColor: '#8e44ad'}}>
            {/* CORREÇÃO DO CABEÇALHO DO ITEM */}
            <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', // Alinha verticalmente
                marginBottom: '8px',
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: '5px'
            }}>
               <span style={{fontWeight: 'bold', color: '#8e44ad', display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <FaFileMedicalAlt /> Exame
               </span>
               <span style={{fontSize: '0.85rem', color: '#7f8c8d', whiteSpace: 'nowrap'}}>
                  {formatDate(item.consulta.data)}
               </span>
            </div>
            <p style={{margin: '5px 0'}}><strong>Solicitação:</strong> {item.solicitacao}</p>
            {item.resultado && <p style={{margin: '8px 0', background: '#f8f9fa', padding: '10px', borderRadius: '6px', border: '1px solid #eee'}}><strong>Resultado:</strong> {item.resultado}</p>}
          </div>
        ));

      // --- AQUI ESTÁ A MUDANÇA PRINCIPAL PARA PRESCRIÇÕES ---
      case 'prescricoes':
        return history.map(item => {
            const isOpen = expandedId === item.id_prescricao;
            
            // Processa o texto para criar uma lista limpa
            // 1. Quebra por nova linha
            // 2. Filtra linhas vazias
            const medicamentos = item.descricao
                ? item.descricao.split('\n').filter(line => line.trim() !== '')
                : [];

            return (
              <div key={item.id_prescricao} className={styles.accordionItem}>
                {/* CABEÇALHO DO ACCORDION - Sempre visível */}
                <div 
                    className={`${styles.accordionHeader} ${isOpen ? styles.accordionHeaderActive : ''}`} 
                    onClick={() => toggleAccordion(item.id_prescricao)}
                >
                  <div className={styles.headerInfo}>
                    <div className={styles.dateBadge}>
                        <FaCalendarAlt color="#3498db"/> 
                        {formatDate(item.consulta.data)}
                    </div>
                    <div className={styles.vetName}>
                        <FaUserMd style={{marginRight: '5px'}}/> 
                        Dr(a). {item.consulta?.veterinario?.nome || 'Não informado'}
                    </div>
                  </div>
                  
                  {/* Ícone de seta que gira */}
                  <FaChevronDown className={`${styles.chevronIcon} ${isOpen ? styles.chevronRotate : ''}`} />
                </div>

                {/* CORPO DO ACCORDION - Visível apenas se aberto */}
                {isOpen && (
                  <div className={styles.accordionBody}>
                     {medicamentos.length > 0 ? (
                        <ul className={styles.prescriptionList}>
                            {medicamentos.map((med, index) => (
                                <li key={index} className={styles.prescriptionItem}>
                                    <FaCircle size={8} className={styles.bullet} />
                                    <span>{med}</span>
                                </li>
                            ))}
                        </ul>
                     ) : (
                         <p style={{fontStyle: 'italic', color: '#999'}}>Nenhum medicamento listado.</p>
                     )}
                     
                     {/* Botão extra de UX: Copiar Texto (Opcional, mas útil) */}
                     <div style={{marginTop: '15px', display: 'flex', justifyContent: 'flex-end'}}>
                        <button 
                           className={styles.addDoseButton} // Reutilizando estilo azul
                           style={{backgroundColor: '#95a5a6', fontSize: '0.8rem'}}
                           onClick={() => {
                               navigator.clipboard.writeText(item.descricao);
                               alert('Texto copiado!');
                           }}
                        >
                            Copiar Texto
                        </button>
                     </div>
                  </div>
                )}
              </div>
            );
        });

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
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>
             {type === 'vacinas' && <FaSyringe color="#27ae60" />}
             {type === 'prescricoes' && <FaPills color="#3498db" />}
             {type === 'exames' && <FaFileMedicalAlt color="#8e44ad" />}
             {titles[type]}
          </h3>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        
        <div className={styles.content}>
          {renderContent()}
        </div>

        <div className={styles.footer}>
          <button onClick={onAddNew} className={styles.addButton}>
            <FaPills style={{marginRight: '5px'}}/> {buttonLabels[type]}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HistoryModal;