// src/pages/Relatorios/Relatorios.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import styles from './Relatorios.module.css';
// ✅ Ícones importados
import { FaChartBar, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';

function Relatorios() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGerarRelatorio = async () => {
    if (!dataInicio || !dataFim) {
      setError('Por favor, selecione a data de início e a data de fim.');
      return;
    }
    if (new Date(dataInicio) > new Date(dataFim)) {
      setError('A data de início não pode ser posterior à data de fim.');
      return;
    }

    setLoading(true);
    setError('');
    setResultado(null);

    try {
      const params = new URLSearchParams({ dataInicio, dataFim }).toString();
      const response = await api.getRelatorioConsultas(params);
      setResultado(response);
    } catch (err) {
      if (err.message.includes('403')) {
        setError('Acesso negado. Apenas administradores podem gerar relatórios.');
      } else {
        setError(err.message || 'Ocorreu um erro ao gerar o relatório.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* ✅ HEADER PADRONIZADO */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Relatórios</h1>
          <p className={styles.pageSubtitle}>Gere e visualize relatórios do sistema</p>
        </div>
      </div>

      {/* ✅ CARD DE CONTEÚDO PRINCIPAL */}
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <FaChartBar />
          <h3>Consultas por Período</h3>
        </div>
        <p className={styles.description}>
          Selecione um intervalo de datas para ver o total de consultas finalizadas.
        </p>
        
        <div className={styles.filtersBar}>
          <div className={styles.filterGroup}>
            <label htmlFor="data-inicio">Data de Início</label>
            <div className={styles.inputIconWrapper}>
              <FaCalendarAlt />
              <input 
                type="date" 
                id="data-inicio"
                value={dataInicio} 
                onChange={(e) => setDataInicio(e.target.value)} 
              />
            </div>
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="data-fim">Data de Fim</label>
            <div className={styles.inputIconWrapper}>
              <FaCalendarAlt />
              <input 
                type="date" 
                id="data-fim"
                value={dataFim} 
                onChange={(e) => setDataFim(e.target.value)} 
              />
            </div>
          </div>
          <button 
            onClick={handleGerarRelatorio} 
            className={styles.generateButton}
            disabled={loading}
          >
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>

        {/* --- ÁREA DE RESULTADO --- */}
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        {resultado && (
          <div className={styles.resultCard}>
            <div className={styles.resultIcon}>
              <FaFileAlt />
            </div>
            <div className={styles.resultContent}>
              <p>
                No período de 
                <strong> {new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'}).format(new Date(resultado.periodo.de))} </strong> 
                a <strong> {new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'}).format(new Date(resultado.periodo.ate))}</strong>, 
                foram realizadas:
              </p>
              <div className={styles.totalConsultas}>
                {resultado.totalConsultas}
              </div>
              <span>consulta(s) finalizada(s).</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Relatorios;