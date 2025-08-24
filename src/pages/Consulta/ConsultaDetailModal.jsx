// src/pages/Consultas/ConsultaDetailModal.jsx

import React from 'react';
import styles from './ConsultaDetailModal.module.css';

function ConsultaDetailModal({ isOpen, onClose, consulta }) {
  if (!isOpen || !consulta) return null;

  // Formato de data/hora
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(dateString));
    } catch {
      return '—';
    }
  };

  const c = consulta;


  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Cabeçalho */}
        <div className={styles.modalHeader}>
          <div>
            <h2>{c.animal?.nome ? c.animal.nome : "Detalhes da Consulta"}</h2>
            <div className={styles.headerMeta}>
              <span><strong>Tutor:</strong> {c.animal?.tutor?.nome || "—"}</span>
              <span><strong>Data/Hora:</strong> {formatDate(c.data)}</span>
            </div>
          </div>
          <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={onClose}>
            Fechar
          </button>
        </div>

        {/* Corpo em duas colunas */}
        <div className={styles.modalBody}>
        
          {/* ESQUERDA - Card com informações do animal */}
          <div className={styles.leftPanel}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>🩺 Última anamnese</h3>
              </div>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <label>Espécie</label>
                  <div className={styles.roInput}>{c.animal?.raca?.especie?.nome || '—'}</div>
                </div>
                <div className={styles.detailItem}>
                  <label>Raça</label>
                  <div className={styles.roInput}>{c.animal?.raca?.nome || '—'}</div>
                </div>
                <div className={styles.detailItem}>
                  <label>Sexo</label>
                  <div className={styles.roInput}>{c.animal?.sexo === 'F' ? 'Fêmea' : 'Macho'}</div>
                </div>
                <div className={styles.detailItem}>
                  <label>Porte</label>
                  <div className={styles.roInput}>{c.animal?.porte || '—'}</div>
                </div>
                <div className={styles.detailItem}>
                  <label>Temperamento</label>
                  <div className={styles.roInput}>{c.animal?.temperamento || '—'}</div>
                </div>
                <div className={styles.detailItem}>
                  <label>Data Nascimento</label>
                  <div className={styles.roInput}>
                    {c.animal?.data_nasc 
                      ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(c.animal.data_nasc))
                      : '—'}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <label>Idade</label>
                  <div className={styles.roInput}>
                    {c.animal?.data_nasc 
                      ? `${Math.floor((new Date() - new Date(c.animal.data_nasc)) / (1000 * 60 * 60 * 24 * 365.25))} anos`
                      : '—'}
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <label>Castrado</label>
                  <div className={styles.roInput}>{c.animal?.castrado ? 'Sim' : 'Não'}</div>
                </div>
              </div> 
              
              {/* Campos de texto longos */}
              <div className={styles.detailItem}>
                <label>Alergias</label>
                <div className={styles.roBlock}>{c.animal?.alergias || 'Nenhuma alergia registrada.'}</div>
              </div>
              <div className={styles.detailItem}>
                <label>Observações</label>
                <div className={styles.roBlock}>{c.animal?.observacoes || 'Nenhuma observação registrada.'}</div>
              </div>
            </div>
          </div>

          {/* DIREITA - Dados da consulta */}
          <div className={styles.rightPanel}>
            <div className={styles.vitalsGrid}>
              <div className={styles.vitalItem}><label>Peso</label><div className={styles.roInput}>{c.peso ?? '—'}</div></div>
              <div className={styles.vitalItem}><label>Temperatura</label><div className={styles.roInput}>{c.temperatura ?? '—'}</div></div>
              <div className={styles.vitalItem}><label>TPC</label><div className={styles.roInput}>{c.tpc ?? '—'}</div></div>
              <div className={styles.vitalItem}><label>Mucosas</label><div className={styles.roInput}>{c.mucosas ?? '—'}</div></div>
              <div className={styles.vitalItem}><label>Frequência Cardíaca</label><div className={styles.roInput}>{c.freq ?? '—'}</div></div>
              <div className={styles.vitalItem}><label>Frequência Respiratória</label><div className={styles.roInput}>{c.resp ?? '—'}</div></div>
            </div>

            <div className={styles.detailItem}><label>Queixa principal</label><div className={styles.roBlock}>{c.queixa || 'Nenhuma queixa registrada.'}</div></div>
            <div className={styles.detailItem}><label>Diagnóstico</label><div className={styles.roBlock}>{c.diagnostico || 'Nenhum diagnóstico registrado.'}</div></div>
            <div className={styles.detailItem}><label>Tratamento</label><div className={styles.roBlock}>{c.tratamento || 'Nenhum tratamento registrado.'}</div></div>
            
            {Array.isArray(c.prescricao) && c.prescricao.length > 0 && (
              <div className={styles.detailItem}><label>Prescrição</label><div className={styles.roBlock}>{c.prescricao[0].descricao || '—'}</div></div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className={styles.modalFooter}>
          <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={onClose}>Cancelar</button>
          <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={onClose}>OK</button>
        </div>
        
      </div>
    </div>
  );
}

export default ConsultaDetailModal;