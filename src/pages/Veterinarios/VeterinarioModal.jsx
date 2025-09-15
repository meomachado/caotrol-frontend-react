// src/pages/Veterinarios/VeterinarioModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from '../Usuarios/SharedModal.module.css';
import { FaUserMd, FaIdCard, FaUser, FaPaw, FaTimes, FaCheck } from 'react-icons/fa';

function VeterinarioModal({ isOpen, onClose, onSave, initialData }) {
  // --- Estados do Formulário ---
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [crmv, setCrmv] = useState('');
  
  // --- Estados de UI e Validação ---
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState({ cpf: true }); // ✅ Estado para validação

  const isEditing = Boolean(initialData);

  // ✅ Função para formatar o CPF (igual ao TutorModal)
  const formatCPF = (value) => {
    if (!value) return "";
    // Remove tudo que não for dígito e limita a 11 caracteres
    value = value.replace(/\D/g, "").slice(0, 11);
    // Aplica a máscara
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value;
  };

  // ✅ Valida o campo CPF para garantir que está completo
  const validateField = (name, value) => {
    if (name === "cpf") {
      setValidation((v) => ({ ...v, cpf: value.length === 14 }));
    }
  };

  // ✅ Novo handler para o campo CPF
  const handleCpfChange = (e) => {
    const { name, value } = e.target;
    const formattedCpf = formatCPF(value);
    setCpf(formattedCpf);
    validateField(name, formattedCpf);
  };

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setNome(initialData.nome || '');
        const formattedCpf = formatCPF(initialData.cpf || '');
        setCpf(formattedCpf);
        setValidation({ cpf: formattedCpf.length === 14 }); // Valida o CPF inicial
        setCrmv(initialData.crmv || '');
      } else {
        setNome('');
        setCpf('');
        setCrmv('');
        setValidation({ cpf: true }); // Reseta validação
      }
      setError('');
    }
  }, [isOpen, initialData, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validação antes de enviar
    if (!validation.cpf) {
        setError('O CPF está incompleto.');
        return;
    }

    setLoading(true);
    setError('');
    try {
      // ✅ Garante que apenas os números do CPF sejam enviados
      const payload = { nome, cpf: cpf.replace(/\D/g, ""), crmv };
      if (isEditing) {
        await api.updateVeterinario(initialData.id_veterinario, payload);
      } else {
        await api.createVeterinario(payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{isEditing ? 'Editar Perfil de Veterinário' : 'Novo Perfil de Veterinário'}</h2>
        </div>
        <form id="vet-form" onSubmit={handleSubmit} className={styles.formBody}>
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>
                <FaUserMd /> Dados Profissionais
              </h3>
              <div className={styles.formGroup}>
                <label>Nome Completo</label>
                <div className={styles.inputIconWrapper}>
                  <FaUser />
                  <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>
                <FaIdCard /> Identificação
              </h3>
              <div className={styles.formGroup}>
                <label>CRMV</label>
                <div className={styles.inputIconWrapper}>
                  <FaPaw />
                  <input type="text" value={crmv} onChange={e => setCrmv(e.target.value)} required />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>CPF</label>
                <div className={styles.inputIconWrapper}>
                  <FaIdCard />
                  {/* ✅ Input de CPF atualizado */}
                  <input 
                    type="text" 
                    name="cpf"
                    value={cpf} 
                    onChange={handleCpfChange} 
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    required 
                    placeholder="000.000.000-00" 
                    maxLength="14" // Impede mais de 14 caracteres (11 números + 3 pontos/traço)
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
        <div className={styles.modalFooter}>
          <div className={styles.errorContainer}>
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>
              <FaTimes /> Cancelar
            </button>
            <button type="submit" form="vet-form" className={`${styles.btn} ${styles.btnSave}`} disabled={loading || !validation.cpf}>
              <FaCheck /> {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VeterinarioModal;