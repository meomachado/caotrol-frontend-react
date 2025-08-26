// src/pages/Animais/AnimalModal.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./AnimalModal.module.css";

function AnimalModal({ isOpen, onClose, onSave, animalToEdit }) {
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [sexo, setSexo] = useState("M");
  const [idTutor, setIdTutor] = useState("");
  const [idEspecie, setIdEspecie] = useState("");
  const [idRaca, setIdRaca] = useState("");
  const [temperamento, setTemperamento] = useState("");
  const [porte, setPorte] = useState("");

  const [racas, setRacas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [error, setError] = useState("");

  // Estados para o autocomplete do tutor
  const [tutorSearchTerm, setTutorSearchTerm] = useState("");
  const [searchedTutores, setSearchedTutores] = useState([]);
  const [showTutorResults, setShowTutorResults] = useState(false);
  const [selectedTutorName, setSelectedTutorName] = useState("");

  // Efeito para buscar raças e espécies
  useEffect(() => {
    if (isOpen) {
      // ✅ CORREÇÃO: Acessa a propriedade .data da resposta da API
      api.get("/racas").then((response) => setRacas(response || []));
      api.get("/especies").then((response) => setEspecies(response || []));
    }
  }, [isOpen]);

  // Efeito para preencher o formulário ao editar ou limpar para um novo
  useEffect(() => {
    if (isOpen) {
      if (animalToEdit) {
        const racaDoAnimal = racas.find((r) => r.id_raca === animalToEdit.id_raca);
        setNome(animalToEdit.nome || "");
        setDataNasc(animalToEdit.data_nasc ? new Date(animalToEdit.data_nasc).toISOString().split("T")[0] : "");
        setSexo(animalToEdit.sexo || "M");
        setIdTutor(animalToEdit.id_tutor || "");
        setSelectedTutorName(animalToEdit.tutor ? `${animalToEdit.tutor.nome} - ${animalToEdit.tutor.cpf}` : "");
        if (racaDoAnimal) setIdEspecie(racaDoAnimal.id_especie);
        setIdRaca(animalToEdit.id_raca || "");
        setTemperamento(animalToEdit.temperamento || "");
        setPorte(animalToEdit.porte || "");
      } else {
        // Limpa todos os campos
        setNome(""); setDataNasc(""); setSexo("M"); setIdTutor("");
        setIdEspecie(""); setIdRaca(""); setTemperamento(""); setPorte("");
        setSelectedTutorName("");
      }
      setError("");
      setSearchedTutores([]);
      setTutorSearchTerm("");
    }
  }, [isOpen, animalToEdit, racas]);

  // Efeito para busca de tutor com debounce
  useEffect(() => {
    if (tutorSearchTerm.length < 2) {
      setSearchedTutores([]);
      setShowTutorResults(false);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      api.get(`/tutores/search?termo=${tutorSearchTerm}`)
        .then(response => {
          // ✅ CORREÇÃO: Acessa a propriedade .data da resposta da API
          setSearchedTutores(response|| []);
          setShowTutorResults(true);
        })
        .catch(err => {
          console.error("Erro na busca de tutor:", err);
          setSearchedTutores([]);
        });
    }, 400); // Debounce de 400ms
    
    return () => clearTimeout(delayDebounceFn);
  }, [tutorSearchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !idTutor || !idRaca) {
      setError("Nome, Tutor e Raça são obrigatórios.");
      return;
    }
    const animalData = {
      nome, data_nasc: dataNasc ? new Date(dataNasc).toISOString() : null,
      sexo, temperamento, porte,
      id_tutor: parseInt(idTutor), id_raca: parseInt(idRaca),
    };
    try {
      if (animalToEdit) {
        await api.put(`/animais/${animalToEdit.id_animal}`, animalData);
      } else {
        await api.post("/animais", animalData);
      }
      onSave();
    } catch (err) {
      setError("Erro ao salvar o animal.");
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const racasFiltradas = idEspecie ? racas.filter((raca) => raca.id_especie === parseInt(idEspecie)) : [];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{animalToEdit ? "Editar Animal" : "Novo Animal"}</h2>
        </div>
        <form id="animal-form" onSubmit={handleSubmit} className={styles.formBody}>
          <div className={styles.formGroup}>
            <label>Nome do Animal</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Tutor</label>
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={selectedTutorName}
              onChange={(e) => {
                setTutorSearchTerm(e.target.value);
                setSelectedTutorName(e.target.value);
                setIdTutor("");
              }}
              onFocus={() => setShowTutorResults(true)}
              onBlur={() => setTimeout(() => setShowTutorResults(false), 200)}
              required
            />
            {showTutorResults && searchedTutores.length > 0 && (
              <ul className={styles.autocompleteList}>
                {searchedTutores.map((tutor) => (
                  <li key={tutor.id_tutor} onMouseDown={() => {
                      setIdTutor(tutor.id_tutor);
                      setSelectedTutorName(`${tutor.nome} - ${tutor.cpf}`);
                      setShowTutorResults(false);
                    }}
                  >
                    {tutor.nome} - {tutor.cpf}
                  </li>
                ))}
              </ul>
            )}
            {showTutorResults && tutorSearchTerm.length > 1 && searchedTutores.length === 0 && (
                <div className={styles.noResults}>Nenhum tutor encontrado.</div>
            )}
          </div>
          <div className={styles.formGroup}>
            <label>Espécie</label>
            <select value={idEspecie} onChange={(e) => { setIdEspecie(e.target.value); setIdRaca(""); }} required>
              <option value="">Selecione uma espécie</option>
              {especies.map((especie) => (
                <option key={especie.id_especie} value={especie.id_especie}>{especie.nome}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Raça</label>
            <select value={idRaca} onChange={(e) => setIdRaca(e.target.value)} required disabled={!idEspecie}>
              <option value="">Selecione uma raça</option>
              {racasFiltradas.map((raca) => (
                <option key={raca.id_raca} value={raca.id_raca}>{raca.nome}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Sexo</label>
            <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
              <option value="M">Macho</option>
              <option value="F">Fêmea</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Data de Nascimento</label>
            <input type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>Temperamento</label>
            <select value={temperamento} onChange={(e) => setTemperamento(e.target.value)}>
              <option value="">Selecione</option>
              <option value="tranquilo">Tranquilo</option>
              <option value="agressivo">Agressivo</option>
              <option value="medroso">Medroso</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Porte</label>
            <select value={porte} onChange={(e) => setPorte(e.target.value)}>
              <option value="">Selecione</option>
              <option value="pequeno">Pequeno</option>
              <option value="medio">Médio</option>
              <option value="grande">Grande</option>
            </select>
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
        </form>
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
          <button type="submit" form="animal-form" className={styles.saveButton}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

export default AnimalModal;
