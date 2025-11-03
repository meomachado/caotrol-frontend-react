// pages/Help/HelpModal.jsx
import React from 'react';
import styles from './HelpModal.module.css';
import { FaTimes, FaQuestionCircle } from 'react-icons/fa';

function HelpModal({ isOpen, onClose, content }) {
  if (!isOpen || !content) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.modalHeader}>
          <h2><FaQuestionCircle /> {content.title || 'Ajuda'}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          {content.sections && content.sections.map((section, index) => (
            <section key={index} className={styles.helpSection}>
              {section.title && <h3 className={styles.sectionTitle}>{section.title}</h3>}
              {section.text && <p className={styles.sectionText}>{section.text}</p>}
            </section>
          ))}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.footerCloseButton}>
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}

export default HelpModal;