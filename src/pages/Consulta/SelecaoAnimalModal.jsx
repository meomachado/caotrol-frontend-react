import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './SelecaoAnimalModal.module.css';
import { FaPlus, FaUserPlus } from 'react-icons/fa';

function SelecaoAnimalModal({ isOpen, onClose, onAnimalSelecionado, onAddNewTutor, onAddNewAnimal, newlyCreatedTutor, newlyCreatedAnimal }) {
  const [tutor, setTutor] = useState(null);
  const [animais, setAnimais] = useState([]);
  const [idAnimal, setIdAnimal] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleTutorSelect = (selectedTutor) => {
    setTutor(selectedTutor);
    const cpfLimpo = String(selectedTutor.cpf).replace(/\D/g, "");
    const cpfDisplay = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    setSearchTerm(`${selectedTutor.nome} - ${cpfDisplay}`);
    setShowSuggestions(false);
    setIdAnimal('');
  };

  useEffect(() => {
    if (isOpen) {
      if (newlyCreatedTutor) {
        handleTutorSelect(newlyCreatedTutor);
      } else {
        setTutor(null);
        setIdAnimal('');
        setAnimais([]);
        setSearchTerm('');
        setSuggestions([]);
      }
    }
  }, [isOpen, newlyCreatedTutor]);
  
  useEffect(() => {
    if (isOpen && newlyCreatedAnimal) {
      setAnimais(prevAnimais => [...prevAnimais, newlyCreatedAnimal]);
      setIdAnimal(newlyCreatedAnimal.id_animal);
    }
  }, [isOpen, newlyCreatedAnimal]);

  useEffect(() => {
    if (searchTerm.length < 2 || tutor) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      api.searchTutores(searchTerm).then(response => {
        setSuggestions(response || []);
      }).finally(() => setIsSearching(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, tutor]);

  useEffect(() => {
    if (tutor) {
      api.getAnimaisByTutor(tutor.id_tutor).then(response => {
        setAnimais(response || []);
      });
    } else {
      setAnimais([]);
    }
  }, [tutor]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Selecionar Paciente</h2>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>1. Busque pelo nome ou CPF do Tutor</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setTutor(null);
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Digite para buscar..."
            />
            {showSuggestions && searchTerm.length >= 2 && !tutor && (
              <div className={styles.autocompleteContainer}>
                {isSearching ? (
                  <div className={styles.noResults}><p>Buscando...</p></div>
                ) : suggestions.length > 0 ? (
                  <ul className={styles.autocompleteList}>
                    {suggestions.map(sug => (
                      <li key={sug.id_tutor} onMouseDown={() => handleTutorSelect(sug)}>
                        {sug.nome} - {sug.cpf}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.noResults}>
                    <p>Nenhum tutor encontrado.</p>
                    <button className={styles.actionButtonSecondary} onMouseDown={onAddNewTutor}>
                      <FaPlus /> Cadastrar este tutor
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {tutor && (
            <div className={styles.formGroup}>
              <label>2. Selecione o Animal</label>
              <div className={styles.animalList}>
                {animais.length > 0 ? (
                  animais.map(animal => (
                    <div key={animal.id_animal} className={`${styles.animalItem} ${idAnimal === animal.id_animal ? styles.selected : ''}`} onClick={() => setIdAnimal(animal.id_animal)}>
                      {animal.nome}
                    </div>
                  ))
                ) : (
                  <div className={styles.noAnimalMessage}>
                    <p>Este tutor não possui animais cadastrados.</p>
                    <button className={styles.actionButtonSecondary} onClick={() => onAddNewAnimal(tutor)}>
                      <FaPlus /> Cadastrar Animal
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.actionButtonSecondary} onClick={onAddNewTutor}>
            <FaUserPlus /> Cadastrar Novo Tutor
          </button>
          <button className={styles.actionButtonNeutral} onClick={onClose}>Cancelar</button>
          <button className={styles.actionButtonPrimary} onClick={() => onAnimalSelecionado(idAnimal)} disabled={!idAnimal}>
            Iniciar Consulta
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelecaoAnimalModal;