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
  const [temperamento, setTemperamento] = useState(""); // NOVO
  const [porte, setPorte] = useState(""); // NOVO

  const [tutores, setTutores] = useState([]);
  const [racas, setRacas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      api.get("/tutores").then((response) => setTutores(response || []));
      api.get("/racas").then((response) => setRacas(response || []));
      api.get("/especies").then((response) => setEspecies(response || []));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (animalToEdit && racas.length > 0) {
        const racaDoAnimal = racas.find(
          (r) => r.id_raca === animalToEdit.id_raca
        );
        setNome(animalToEdit.nome || "");
        setDataNasc(
          animalToEdit.data_nasc
            ? new Date(animalToEdit.data_nasc).toISOString().split("T")[0]
            : ""
        );
        setSexo(animalToEdit.sexo || "M");
        setIdTutor(animalToEdit.id_tutor || "");
        if (racaDoAnimal) setIdEspecie(racaDoAnimal.id_especie);
        setIdRaca(animalToEdit.id_raca || "");
        setTemperamento(animalToEdit.temperamento || ""); // NOVO
        setPorte(animalToEdit.porte || ""); // NOVO
      } else {
        setNome("");
        setDataNasc("");
        setSexo("M");
        setIdTutor("");
        setIdEspecie("");
        setIdRaca("");
        setTemperamento(""); // NOVO
        setPorte(""); // NOVO
      }
      setError("");
    }
  }, [isOpen, animalToEdit, tutores, racas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !idTutor || !idRaca) {
      setError("Nome, Tutor e Raça são obrigatórios.");
      return;
    }

    const animalData = {
      nome,
      data_nasc: dataNasc ? new Date(dataNasc).toISOString() : null,
      sexo,
      temperamento, // NOVO
      porte, // NOVO
      id_tutor: parseInt(idTutor),
      id_raca: parseInt(idRaca),
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

  const racasFiltradas = racas.filter(
    (raca) => raca.id_especie === parseInt(idEspecie)
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{animalToEdit ? "Editar Animal" : "Novo Animal"}</h2>
        <form
          id="animal-form"
          onSubmit={handleSubmit}
          className={styles.formBody}
        >
          <div className={styles.formGroup}>
            <label>Nome do Animal</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Tutor</label>
            <select
              value={idTutor}
              onChange={(e) => setIdTutor(e.target.value)}
              required
            >
              <option value="">Selecione um tutor</option>
              {tutores.map((tutor) => (
                <option key={tutor.id_tutor} value={tutor.id_tutor}>
                  {tutor.nome}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Espécie</label>
            <select
              value={idEspecie}
              onChange={(e) => {
                setIdEspecie(e.target.value);
                setIdRaca("");
              }}
              required
            >
              <option value="">Selecione uma espécie</option>
              {especies.map((especie) => (
                <option key={especie.id_especie} value={especie.id_especie}>
                  {especie.nome}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Raça</label>
            <select
              value={idRaca}
              onChange={(e) => setIdRaca(e.target.value)}
              required
              disabled={!idEspecie}
            >
              <option value="">Selecione uma raça</option>
              {racasFiltradas.map((raca) => (
                <option key={raca.id_raca} value={raca.id_raca}>
                  {raca.nome}
                </option>
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
            <input
              type="date"
              value={dataNasc}
              onChange={(e) => setDataNasc(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Temperamento</label>
            <select
              value={temperamento}
              onChange={(e) => setTemperamento(e.target.value)}
            >
              <option value="">Selecione</option>
              {/* 👇 Valores corrigidos para minúsculas 👇 */}
              <option value="tranquilo">Tranquilo</option>
              <option value="agressivo">Agressivo</option>
              <option value="medroso">Medroso</option>
              {/* Outras opções como 'Agitado' e 'Sociável' não existem no enum, então foram removidas */}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Porte</label>
            <select value={porte} onChange={(e) => setPorte(e.target.value)}>
              <option value="">Selecione</option>
              {/* 👇 Valores corrigidos para minúsculas e sem acento 👇 */}
              <option value="pequeno">Pequeno</option>
              <option value="medio">Médio</option>
              <option value="grande">Grande</option>
            </select>
          </div>
        </form>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="animal-form"
            className={styles.saveButton}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnimalModal;
