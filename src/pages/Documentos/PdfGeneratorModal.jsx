import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaPlus, FaPrescriptionBottleAlt, FaExclamationTriangle, FaFilePdf, FaSave } from "react-icons/fa";

// Estilos inline
const styles = {
  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)", display: "flex",
    alignItems: "center", justifyContent: "center", 
    zIndex: 2200,
    backdropFilter: "blur(3px)"
  },
  modalContainer: {
    backgroundColor: "#fff", borderRadius: "12px", width: "90%",
    maxWidth: "600px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    display: 'flex', flexDirection: 'column', maxHeight: '90vh'
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 25px", borderBottom: "1px solid #eee", backgroundColor: "#f8f9fa"
  },
  modalTitle: { margin: 0, color: "#2c3e50", fontSize: "1.25rem", display: 'flex', alignItems: 'center', gap: '10px' },
  closeButton: { background: "none", border: "none", fontSize: "1.2rem", color: "#95a5a6", cursor: "pointer", transition: "color 0.2s" },
  modalContent: { padding: "25px", overflowY: 'auto', flex: 1 },
  
  // --- Ações ---
  modalActions: {
    display: "flex", justifyContent: "flex-end", gap: "10px", // Gap ajustado
    padding: "20px 25px", borderTop: "1px solid #eee", backgroundColor: "#f8f9fa"
  },
  btnCancel: { padding: "10px 15px", border: "1px solid #ccc", borderRadius: "6px", background: "#fff", cursor: "pointer", color: "#555", fontWeight: "600" },
  
  // Botão Verde (Gerar PDF)
  btnConfirm: { padding: "10px 15px", border: "none", borderRadius: "6px", background: "#27ae60", color: "white", fontWeight: "bold", cursor: "pointer", display: 'flex', alignItems: 'center', gap: '8px' },
  
  // Botão Azul (Apenas Salvar)
  btnSaveOnly: { padding: "10px 15px", border: "none", borderRadius: "6px", background: "#3498db", color: "white", fontWeight: "bold", cursor: "pointer", display: 'flex', alignItems: 'center', gap: '8px' },

  // --- Construtor de Lista ---
  label: { display: "block", marginBottom: "10px", fontWeight: "600", color: "#2c3e50" },
  inputGroup: { display: 'flex', gap: '10px', marginBottom: '20px' },
  inputField: { flex: 1, padding: "12px", border: "2px solid #e0e0e0", borderRadius: "8px", fontSize: "1rem", transition: "border-color 0.3s", outline: "none" },
  addButton: {
    padding: "0 20px", backgroundColor: "#3498db", color: "white", border: "none",
    borderRadius: "8px", cursor: "pointer", fontSize: "1.2rem", display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', marginBottom: '10px' },
  listItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: '#f8f9fa', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #3498db'
  },
  itemText: { flex: 1, marginRight: '15px', whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: '#34495e', lineHeight: '1.4' },
  removeButton: {
    background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer',
    padding: '2px', display: 'flex', alignItems: 'center', fontSize: '1rem'
  },
  emptyState: { textAlign: 'center', color: '#95a5a6', fontStyle: 'italic', padding: '20px', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' },

  warningBox: {
    marginTop: "15px",
    backgroundColor: "#fff7ed",
    borderLeft: "4px solid #f97316",
    padding: "12px 16px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    color: "#9a3412",
    fontSize: "0.9rem",
    lineHeight: "1.4"
  }
};

const PdfGeneratorModal = ({
  isOpen,
  onClose,
  onGeneratePdf, // Ação de Salvar + PDF
  onSaveOnly,    // NOVA AÇÃO: Apenas Salvar
  title = "Gerar Documento",
  label = "Itens do documento:",
  initialText = "",
  confirmButtonText = "Gerar PDF e Salvar",
}) => {
  const [items, setItems] = useState([]);
  const [currentItemText, setCurrentItemText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialText) {
        const existingItems = initialText.split('\n').filter(item => item.trim() !== '');
        setItems(existingItems);
      } else {
        setItems([]);
      }
      setCurrentItemText("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialText]);

  const handleAddItem = () => {
    if (!currentItemText.trim()) return;
    setItems([...items, currentItemText.trim()]);
    setCurrentItemText("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleAddItem();
    }
  };

  const handleRemoveItem = (indexToRemove) => {
    setItems(items.filter((_, index) => index !== indexToRemove));
  };

  // Salvar + PDF
  const handleConfirm = () => {
    const finalString = items.join('\n');
    onGeneratePdf(finalString);
  };

  // Apenas Salvar
  const handleSaveOnlyClick = () => {
    if (onSaveOnly) {
      const finalString = items.join('\n');
      onSaveOnly(finalString);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>
            <FaPrescriptionBottleAlt color="#3498db" /> {title}
          </h3>
          <button style={styles.closeButton} onClick={onClose} title="Fechar">
            <FaTimes />
          </button>
        </div>

        <div style={styles.modalContent}>
          <label style={styles.label}>{label}</label>
          
          <div style={styles.inputGroup}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Digite o item e aperte Enter..."
              value={currentItemText}
              onChange={(e) => setCurrentItemText(e.target.value)}
              onKeyDown={handleKeyPress}
              style={styles.inputField}
            />
            <button 
                onClick={handleAddItem} 
                style={{...styles.addButton, opacity: !currentItemText.trim() ? 0.6 : 1}} 
                title="Adicionar item"
                disabled={!currentItemText.trim()}
            >
              <FaPlus />
            </button>
          </div>

          <div style={styles.listContainer}>
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} style={styles.listItem}>
                  <span style={styles.itemText}>{index + 1}. {item}</span>
                  <button onClick={() => handleRemoveItem(index)} style={styles.removeButton}>
                    <FaTimes />
                  </button>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>Nenhum item adicionado.</div>
            )}
          </div>

          <div style={styles.warningBox}>
            <FaExclamationTriangle size={18} />
            <span>
              <strong>Atenção:</strong> Lembre-se de salvar suas alterações abaixo.
            </span>
          </div>
        </div>

        <div style={styles.modalActions}>
          <button onClick={onClose} style={styles.btnCancel}>Cancelar</button>
          
          {/* BOTÃO APENAS SALVAR (Se a função for passada) */}
          {onSaveOnly && (
            <button 
              onClick={handleSaveOnlyClick} 
              style={{...styles.btnSaveOnly, opacity: items.length === 0 ? 0.6 : 1}}
              disabled={items.length === 0}
            >
              <FaSave /> Salvar
            </button>
          )}

          {/* BOTÃO SALVAR E GERAR PDF */}
          <button 
            onClick={handleConfirm} 
            style={{...styles.btnConfirm, opacity: items.length === 0 ? 0.6 : 1}}
            disabled={items.length === 0}
          >
            <FaFilePdf /> {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfGeneratorModal;