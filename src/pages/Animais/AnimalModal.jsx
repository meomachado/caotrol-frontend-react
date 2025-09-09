// src/pages/Animais/AnimalModal.jsx
import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import styles from "./AnimalModal.module.css";

function AnimalModal({ isOpen, onClose, onSave, animalToEdit }) {
  // --- ESTADOS DO FORMULÁRIO ---
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [sexo, setSexo] = useState("M");
  const [idTutor, setIdTutor] = useState("");
  const [idEspecie, setIdEspecie] = useState("");
  const [idRaca, setIdRaca] = useState("");
  const [temperamento, setTemperamento] = useState("");
  const [porte, setPorte] = useState("");

  // --- ESTADOS DE UI E DADOS ---
  const [racas, setRacas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Estados para busca de Tutor
  const [tutorSearchTerm, setTutorSearchTerm] = useState("");
  const [searchedTutores, setSearchedTutores] = useState([]);
  const [showTutorResults, setShowTutorResults] = useState(false);
  const [selectedTutorName, setSelectedTutorName] = useState("");

  // ✅ Estados para busca de Raça
  const [racaSearchTerm, setRacaSearchTerm] = useState("");
  const [showRacaResults, setShowRacaResults] = useState(false);

  // --- REFS PARA UX ---
  const nomeInputRef = useRef(null);

  // --- LÓGICA DE VALIDAÇÃO ---
  const isFormInvalid = !nome || !idTutor || !idEspecie || !idRaca;

  // Efeito para buscar raças e espécies
  useEffect(() => {
    if (isOpen) {
      api.get("/racas").then((response) => setRacas(response || []));
      api.get("/especies").then((response) => setEspecies(response || []));
    }
  }, [isOpen]);

  // Efeito para preencher o formulário ao editar ou limpar para um novo
  useEffect(() => {
    if (isOpen) {
      setError("");
      setSearchedTutores([]);
      setTutorSearchTerm("");

      if (animalToEdit && racas.length > 0) {
        // Garante que as raças já foram carregadas
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
        setSelectedTutorName(
          animalToEdit.tutor
            ? `${animalToEdit.tutor.nome} - ${animalToEdit.tutor.cpf}`
            : ""
        );
        if (racaDoAnimal) {
          setIdEspecie(racaDoAnimal.id_especie);
          setRacaSearchTerm(racaDoAnimal.nome); // ✅ Preenche o campo de busca da raça
        }
        setIdRaca(animalToEdit.id_raca || "");
        setTemperamento(animalToEdit.temperamento || "");
        setPorte(animalToEdit.porte || "");
      } else {
        setNome("");
        setDataNasc("");
        setSexo("M");
        setIdTutor("");
        setIdEspecie("");
        setIdRaca("");
        setTemperamento("");
        setPorte("");
        setSelectedTutorName("");
        setRacaSearchTerm(""); // ✅ Limpa o campo de busca
      }
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
      api
        .get(`/tutores/search?termo=${tutorSearchTerm}`)
        .then((response) => {
          setSearchedTutores(response || []);
          setShowTutorResults(true);
        })
        .catch((err) => {
          console.error("Erro na busca de tutor:", err);
          setSearchedTutores([]);
        });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [tutorSearchTerm]);

  // Efeitos de UX: Autofocus e fechar com Esc
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nomeInputRef.current?.focus(), 100);
      const handleEsc = (event) => {
        if (event.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormInvalid) {
      setError("Nome, Tutor, Espécie e Raça são obrigatórios.");
      return;
    }
    setIsSaving(true);
    setError("");
    const animalData = {
      nome,
      data_nasc: dataNasc ? new Date(dataNasc).toISOString() : null,
      sexo,
      temperamento,
      porte,
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
      setError(err.response?.data?.message || "Erro ao salvar o animal.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // ✅ Lógica para filtrar as raças com base na busca do usuário
  const racasDisponiveis = idEspecie
    ? racas.filter((raca) => raca.id_especie === parseInt(idEspecie))
    : [];
  const racasFiltradas = racaSearchTerm
    ? racasDisponiveis.filter((raca) =>
        raca.nome.toLowerCase().includes(racaSearchTerm.toLowerCase())
      )
    : racasDisponiveis;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{animalToEdit ? "Editar Animal" : "Novo Animal"}</h2>
        </div>
        <form
          id="animal-form"
          onSubmit={handleSubmit}
          className={styles.formBody}
        >
          {/* PAINEL ESQUERDO */}
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Identificação</h3>
              <div className={styles.formGroup}>
                <label>Nome do Animal</label>
                <div className={styles.inputIconWrapper}>
                  <i className="fas fa-paw"></i>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    ref={nomeInputRef}
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Tutor</label>
                <div className={styles.inputIconWrapper}>
                  <i className="fas fa-user"></i>
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
                    onBlur={() =>
                      setTimeout(() => setShowTutorResults(false), 200)
                    }
                    required
                  />
                </div>
                {showTutorResults && searchedTutores.length > 0 && (
                  <ul className={styles.autocompleteList}>
                    {searchedTutores.map((tutor) => (
                      <li
                        key={tutor.id_tutor}
                        onMouseDown={() => {
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
              </div>
              <div className={styles.formGroup}>
                <label>Espécie</label>
                <select
                  value={idEspecie}
                  onChange={(e) => {
                    setIdEspecie(e.target.value);
                    setIdRaca("");
                    setRacaSearchTerm("");
                  }}
                  required
                >
                  <option value="">Selecione...</option>
                  {especies.map((especie) => (
                    <option key={especie.id_especie} value={especie.id_especie}>
                      {especie.nome}
                    </option>
                  ))}
                </select>
              </div>
              {/* ✅ CAMPO RAÇA ATUALIZADO */}
              <div className={styles.formGroup}>
                <label>Raça</label>
                <div className={styles.inputIconWrapper}>
                  <i className="fas fa-dog"></i>
                  <input
                    type="text"
                    placeholder="Digite para buscar a raça..."
                    value={racaSearchTerm}
                    onChange={(e) => {
                      setRacaSearchTerm(e.target.value);
                      setIdRaca(""); // Limpa o ID ao digitar
                    }}
                    onFocus={() => setShowRacaResults(true)}
                    onBlur={() =>
                      setTimeout(() => setShowRacaResults(false), 200)
                    }
                    disabled={!idEspecie}
                    required
                  />
                </div>
                {showRacaResults && racasFiltradas.length > 0 && (
                  <ul className={styles.autocompleteList}>
                    {racasFiltradas.map((raca) => (
                      <li
                        key={raca.id_raca}
                        onMouseDown={() => {
                          setIdRaca(raca.id_raca);
                          setRacaSearchTerm(raca.nome);
                          setShowRacaResults(false);
                        }}
                      >
                        {raca.nome}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* PAINEL DIREITO */}
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Características</h3>
              <div className={styles.formGroup}>
                <label>Sexo</label>
                <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
                  <option value="M">Macho</option>
                  <option value="F">Fêmea</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Data de Nascimento</label>
                <div className={styles.inputIconWrapper}>
                  <i className="fas fa-calendar-alt"></i>
                  <input
                    type="date"
                    value={dataNasc}
                    onChange={(e) => setDataNasc(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Porte</label>
                <select
                  value={porte}
                  onChange={(e) => setPorte(e.target.value)}
                >
                  <option value="">Não informado</option>
                  <option value="pequeno">Pequeno</option>
                  <option value="medio">Médio</option>
                  <option value="grande">Grande</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Temperamento</label>
                <select
                  value={temperamento}
                  onChange={(e) => setTemperamento(e.target.value)}
                >
                  <option value="">Não informado</option>
                  <option value="tranquilo">Tranquilo</option>
                  <option value="agressivo">Agressivo</option>
                  <option value="medroso">Medroso</option>
                </select>
              </div>
            </div>
          </div>
        </form>
        <div className={styles.modalFooter}>
          <div className={styles.errorContainer}>
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.btn} ${styles.btnCancel}`}
            >
              <i className="fas fa-times"></i> Cancelar
            </button>
            <button
              type="submit"
              form="animal-form"
              className={`${styles.btn} ${styles.btnSave}`}
              disabled={isFormInvalid || isSaving}
            >
              <i className="fas fa-check"></i>{" "}
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimalModal;
