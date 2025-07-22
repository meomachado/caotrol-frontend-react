// src/pages/Tutores/TutorModal.jsx

import React, { useState, useEffect } from 'react'; // Certifique-se de importar o useEffect
import api from '../../services/api';
import styles from './TutorModal.module.css';

// A prop 'tutorToEdit' é a chave aqui
function TutorModal({ isOpen, onClose, onSave, tutorToEdit }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [error, setError] = useState('');

  // ✅ ESTE É O BLOCO DE CÓDIGO QUE ESTAVA FALTANDO ✅
  // Ele executa toda vez que o modal abre ou o tutor a ser editado muda.
  useEffect(() => {
    if (isOpen) {
      if (tutorToEdit) {
        // MODO EDIÇÃO: Se recebemos um tutor, preenchemos o formulário com seus dados.
        setNome(tutorToEdit.nome || '');
        setCpf(tutorToEdit.cpf || '');
        setTelefone(tutorToEdit.telefone || '');
      } else {
        // MODO CRIAÇÃO: Se não há tutor, garantimos que o formulário está limpo.
        setNome('');
        setCpf('');
        setTelefone('');
      }
      // Limpa qualquer mensagem de erro anterior ao abrir o modal
      setError(''); 
    }
  }, [isOpen, tutorToEdit]); // A "dependência" que aciona este efeito

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nome || !cpf || !telefone) {
      setError('Nome, CPF e Telefone são obrigatórios.');
      return;
    }

    const tutorData = { nome, cpf, telefone };

    try {
      if (tutorToEdit) {
        // Se estiver editando, chama o método PUT
        await api.put(`/tutores/${tutorToEdit.id_tutor}`, tutorData);
      } else {
        // Se não, chama o método POST para criar
        await api.post('/tutores', tutorData);
      }
      onSave(); // Avisa a página principal para recarregar a lista e fechar
    } catch (err) {
      setError('Erro ao salvar o tutor.');
      console.error(err);
    }
  };

  // Se o modal não estiver aberto, não renderiza nada
  if (!isOpen) {
    return null;
  }

  // O JSX do formulário continua o mesmo
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{tutorToEdit ? 'Editar Tutor' : 'Novo Tutor'}</h2>
        <form onSubmit={handleSubmit}>
          {/* Nenhuma mudança necessária aqui no formulário */}
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
              required
              placeholder="Apenas números"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="telefone">Telefone</label>
            <input
              type="text"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveButton}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TutorModal;