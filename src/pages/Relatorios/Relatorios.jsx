// pages/Relatorios/Relatorios.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import styles from './Relatorios.module.css';

function Relatorios() {
  // Estados para os filtros de data
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Estados para controlar o resultado e a interface
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
      // Monta os parâmetros para a URL
      const params = new URLSearchParams({ dataInicio, dataFim }).toString();
      const response = await api.getRelatorioConsultas(params);
      setResultado(response);
    } catch (err) {
      // O back-end retorna 403 (Forbidden) se o usuário não for admin
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
    <div className={styles.relatoriosContainer}>
      <div className={styles.header}>
        <h1>Relatórios</h1>
      </div>

      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Consultas por Período</h3>
        <p className={styles.description}>
          Selecione um intervalo de datas para ver o total de consultas finalizadas.
        </p>
        
        <div className={styles.filtersBar}>
          <div className={styles.filterGroup}>
            <label htmlFor="data-inicio">Data de Início</label>
            <input 
              type="date" 
              id="data-inicio"
              value={dataInicio} 
              onChange={(e) => setDataInicio(e.target.value)} 
            />
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="data-fim">Data de Fim</label>
            <input 
              type="date" 
              id="data-fim"
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)} 
            />
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
            <h4>Resultado</h4>
            <p>
              No período de 
              <strong> {new Intl.DateTimeFormat('pt-BR').format(new Date(resultado.periodo.de))} </strong> 
              a <strong> {new Intl.DateTimeFormat('pt-BR').format(new Date(resultado.periodo.ate))}</strong>, 
              foram realizadas:
            </p>
            <div className={styles.totalConsultas}>
              {resultado.totalConsultas}
            </div>
            <span>consulta(s) finalizada(s).</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Relatorios;