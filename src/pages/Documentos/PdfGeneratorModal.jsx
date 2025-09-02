import React, { useState, useEffect } from 'react';
import styles from './PdfGeneratorModal.module.css';

function PdfGeneratorModal({ isOpen, onClose, onGeneratePdf, title, label, initialText }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText(initialText || ''); // Preenche com texto existente se houver
    }
  }, [isOpen, initialText]);

  const handleGenerateClick = () => {
    if (!text.trim()) {
      alert('O campo de texto não pode estar vazio.');
      return;
    }
    onGeneratePdf(text); // Envia o texto para a função que gera o PDF
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{title}</h2>
        <div className={styles.modalBody}>
          <label>{label}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="15"
            placeholder={`Digite o conteúdo aqui...`}
          />
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
          <button onClick={handleGenerateClick} className={styles.generateButton}>
            Gerar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default PdfGeneratorModal;