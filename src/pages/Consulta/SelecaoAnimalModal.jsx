// src/pages/Consultas/SelecaoAnimalModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './SelecaoAnimalModal.module.css';

function SelecaoAnimalModal({ isOpen, onClose, onAnimalSelecionado }) {
  const [tutores, setTutores] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [idTutor, setIdTutor] = useState('');
  const [idAnimal, setIdAnimal] = useState('');

  // Busca a lista de tutores quando o modal abre
  useEffect(() => {
    if (isOpen) {
      // Limpa os estados anteriores
      setIdTutor('');
      setIdAnimal('');
      setAnimais([]);
      
      // Assumindo uma rota que busca todos os tutores
      api.get('/tutores').then(response => {
        setTutores(response.data || []);
      });
    }
  }, [isOpen]);

  // Busca os animais do tutor selecionado
  useEffect(() => {
    if (idTutor) {
      setIdAnimal(''); // Limpa a seleção de animal ao trocar de tutor
      // Assumindo a rota que busca animais de um tutor
      api.get(`/tutores/${idTutor}/animais`).then(response => {
        setAnimais(response || []);
      });
    }
  }, [idTutor]);

  const handleConfirmar = () => {
    if (idAnimal) {
      onAnimalSelecionado(idAnimal);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}><h2>Selecionar Paciente</h2></div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>1. Selecione o Tutor</label>
            <select value={idTutor} onChange={e => setIdTutor(e.target.value)}>
              <option value="">-- Busque ou selecione um tutor --</option>
              {tutores.map(tutor => (
                <option key={tutor.id_tutor} value={tutor.id_tutor}>
                  {tutor.nome} - {tutor.cpf}
                </option>
              ))}
            </select>
          </div>
          {idTutor && (
            <div className={styles.formGroup}>
              <label>2. Selecione o Animal</label>
              <ul className={styles.animalList}>
                {animais.length > 0 ? (
                  animais.map(animal => (
                    <li
                      key={animal.id_animal}
                      className={`${styles.animalItem} ${idAnimal === animal.id_animal ? styles.selected : ''}`}
                      onClick={() => setIdAnimal(animal.id_animal)}
                    >
                      {animal.nome}
                    </li>
                  ))
                ) : (
                  <li className={styles.animalItem}>Nenhum animal encontrado.</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.buttonSecondary} onClick={onClose}>Cancelar</button>
          <button className={styles.buttonPrimary} onClick={handleConfirmar} disabled={!idAnimal}>
            Iniciar Consulta
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelecaoAnimalModal;