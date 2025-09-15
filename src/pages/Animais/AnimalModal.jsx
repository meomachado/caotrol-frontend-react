import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import styles from "./AnimalModal.module.css";

function AnimalModal({ isOpen, onClose, onSave, animalToEdit, tutorToPreselect }) {
  // --- ESTADOS DO FORMULÁRIO ---
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [sexo, setSexo] = useState("M");
  const [idTutor, setIdTutor] = useState(null);
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

  const [racaSearchTerm, setRacaSearchTerm] = useState("");
  const [showRacaResults, setShowRacaResults] = useState(false);
  const nomeInputRef = useRef(null);

  const isFormInvalid = !nome || !dataNasc || !idTutor || !idEspecie || !idRaca;

  useEffect(() => {
    if (isOpen) {
      api.get("/racas").then((response) => setRacas(response || []));
      api.get("/especies").then((response) => setEspecies(response || []));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSearchedTutores([]);

      // Limpa os campos do animal, mas preserva o tutor se ele for pré-selecionado
      setNome("");
      setDataNasc("");
      setSexo("M");
      setIdEspecie("");
      setIdRaca("");
      setTemperamento("");
      setPorte("");
      setRacaSearchTerm("");

      if (animalToEdit && racas.length > 0) {
        // Lógica para EDIÇÃO
        const racaDoAnimal = racas.find((r) => r.id_raca === animalToEdit.id_raca);
        setNome(animalToEdit.nome || "");
        setDataNasc(animalToEdit.data_nasc ? new Date(animalToEdit.data_nasc).toISOString().split("T")[0] : "");
        setSexo(animalToEdit.sexo || "M");
        setIdTutor(animalToEdit.id_tutor || "");
        setTutorSearchTerm(animalToEdit.tutor ? `${animalToEdit.tutor.nome} - ${animalToEdit.tutor.cpf}` : "");
        if (racaDoAnimal) {
          setIdEspecie(racaDoAnimal.id_especie);
          setRacaSearchTerm(racaDoAnimal.nome);
        }
        setIdRaca(animalToEdit.id_raca || "");
        setTemperamento(animalToEdit.temperamento || "");
        setPorte(animalToEdit.porte || "");
      } else if (tutorToPreselect) {
        // LÓGICA PARA PRÉ-SELEÇÃO
        setIdTutor(tutorToPreselect.id_tutor);
        const cpfDisplay = String(tutorToPreselect.cpf).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        setTutorSearchTerm(`${tutorToPreselect.nome} - ${cpfDisplay}`);
      } else {
        // Limpa tudo se for um cadastro novo sem pré-seleção
        setIdTutor(null);
        setTutorSearchTerm("");
      }
    }
  }, [isOpen, animalToEdit, racas, tutorToPreselect]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nomeInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // A dependência 'searchedTutores' foi removida para evitar o loop.
  useEffect(() => {
    const isTutorSelected = searchedTutores.some(tutor => `${tutor.nome} - ${tutor.cpf}` === tutorSearchTerm);
    if (!isTutorSelected) {
      setIdTutor(null);
    }
    
    if (tutorSearchTerm.length < 2) {
      setSearchedTutores([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      api.get(`/tutores/search?termo=${tutorSearchTerm}`)
        .then((response) => {
          setSearchedTutores(response || []);
        })
        .catch(() => setSearchedTutores([]));
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [tutorSearchTerm]);

  const handleSave = async (action) => {
    if (isFormInvalid) {
      setError("Campos com * são obrigatórios.");
      return;
    }
    if (!idTutor) {
      setError("Por favor, selecione um tutor da lista de busca.");
      return;
    }
    setIsSaving(true);
    setError("");
    const animalData = {
      nome,
      data_nasc: dataNasc ? new Date(dataNasc).toISOString() : null,
      sexo,
      temperamento: temperamento || null,
      porte: porte || null,
      id_tutor: parseInt(idTutor),
      id_raca: parseInt(idRaca),
    };

    try {
      const savedAnimal = animalToEdit
        ? await api.updateAnimal(animalToEdit.id_animal, animalData)
        : await api.createAnimal(animalData);

      if (action === 'saveAndAddAnother') {
        alert('Animal salvo com sucesso! Cadastre o próximo.');
        setNome('');
        setDataNasc('');
        setSexo('M');
        setIdEspecie('');
        setIdRaca('');
        setTemperamento('');
        setPorte('');
        setRacaSearchTerm('');
        nomeInputRef.current?.focus();
      } else {
        onSave(savedAnimal);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao salvar o animal.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const racasDisponiveis = idEspecie ? racas.filter((raca) => raca.id_especie === parseInt(idEspecie)) : [];
  const racasFiltradas = racaSearchTerm ? racasDisponiveis.filter((raca) => raca.nome.toLowerCase().includes(racaSearchTerm.toLowerCase())) : racasDisponiveis;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}><h2>{animalToEdit ? "Editar Animal" : "Novo Animal"}</h2></div>
        <form id="animal-form" className={styles.formBody}>
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Identificação</h3>
              <div className={styles.formGroup}><label>Nome do Animal <span style={{ color: "red" }}>*</span></label><div className={styles.inputIconWrapper}><i className="fas fa-paw"></i><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} ref={nomeInputRef} required /></div></div>
              <div className={styles.formGroup}>
                <label>Tutor <span style={{ color: "red" }}>*</span></label>
                <div className={styles.inputIconWrapper}>
                  <i className="fas fa-user"></i>
                  <input 
                    type="text" 
                    placeholder="Buscar por nome ou CPF..." 
                    value={tutorSearchTerm} 
                    onChange={(e) => { 
                      setTutorSearchTerm(e.target.value); 
                      setShowTutorResults(true);
                    }} 
                    onFocus={() => setShowTutorResults(true)} 
                    onBlur={() => setTimeout(() => setShowTutorResults(false), 200)} 
                    required disabled={!!tutorToPreselect} 
                  />
                </div>
                {showTutorResults && searchedTutores.length > 0 && (
                  <ul className={styles.autocompleteList}>
                    {searchedTutores.map((tutor) => (
                      <li key={tutor.id_tutor} onMouseDown={() => { 
                        setIdTutor(tutor.id_tutor); 
                        setTutorSearchTerm(`${tutor.nome} - ${tutor.cpf}`); 
                        setShowTutorResults(false); 
                      }}>
                        {tutor.nome} - {tutor.cpf}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={styles.formGroup}><label>Espécie <span style={{ color: 'red' }}>*</span></label><select value={idEspecie} onChange={(e) => { setIdEspecie(e.target.value); setIdRaca(""); setRacaSearchTerm(""); }} required><option value="">Selecione...</option>{especies.map((especie) => (<option key={especie.id_especie} value={especie.id_especie}>{especie.nome}</option>))}</select></div>
              <div className={styles.formGroup}><label>Raça <span style={{ color: 'red' }}>*</span></label><div className={styles.inputIconWrapper}><i className="fas fa-dog"></i><input type="text" placeholder="Digite para buscar a raça..." value={racaSearchTerm} onChange={(e) => { setRacaSearchTerm(e.target.value); setIdRaca(""); }} onFocus={() => setShowRacaResults(true)} onBlur={() => setTimeout(() => setShowRacaResults(false), 200)} disabled={!idEspecie} required /></div>{showRacaResults && racasFiltradas.length > 0 && (<ul className={styles.autocompleteList}>{racasFiltradas.map((raca) => (<li key={raca.id_raca} onMouseDown={() => { setIdRaca(raca.id_raca); setRacaSearchTerm(raca.nome); setShowRacaResults(false); }}>{raca.nome}</li>))}</ul>)}</div>
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Características</h3>
              <div className={styles.formGroup}><label>Sexo <span style={{ color: 'red' }}>*</span></label><select value={sexo} onChange={(e) => setSexo(e.target.value)}><option value="M">Macho</option><option value="F">Fêmea</option></select></div>
              <div className={styles.formGroup}><label>Data de Nascimento <span style={{ color: 'red' }}>*</span></label><div className={styles.inputIconWrapper}><i className="fas fa-calendar-alt"></i><input type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} /></div></div>
              <div className={styles.formGroup}><label>Porte</label><select value={porte} onChange={(e) => setPorte(e.target.value)}><option value="">Não informado</option><option value="pequeno">Pequeno</option><option value="medio">Médio</option><option value="grande">Grande</option></select></div>
              <div className={styles.formGroup}><label>Temperamento</label><select value={temperamento} onChange={(e) => setTemperamento(e.target.value)}><option value="">Não informado</option><option value="tranquilo">Tranquilo</option><option value="agressivo">Agressivo</option><option value="medroso">Medroso</option></select></div>
            </div>
          </div>
        </form>
        <div className={styles.modalFooter}>
          <div className={styles.errorContainer}>{error ? <p className={styles.errorMessage}>{error}</p> : <p style={{ fontSize: '0.9em', color: '#6c757d', margin: 0 }}>Campos com <span style={{ color: 'red' }}>*</span> são obrigatórios.</p>}</div>
          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}><i className="fas fa-times"></i> Cancelar</button>
            
            {animalToEdit ? (
              <button type="button" onClick={() => handleSave('saveAndClose')} className={`${styles.btn} ${styles.btnSave}`} disabled={isFormInvalid || isSaving}>
                <i className="fas fa-check"></i> {isSaving ? "Salvando..." : "Salvar Alterações"}
              </button>
            ) : (
              <>
                <button type="button" onClick={() => handleSave('saveAndClose')} className={`${styles.btn} ${styles.btnSave}`} disabled={isFormInvalid || isSaving}>
                  <i className="fas fa-check"></i> {isSaving ? "Salvando..." : "Salvar e Concluir"}
                </button>
                <button type="button" onClick={() => handleSave('saveAndAddAnother')} className={`${styles.btn} ${styles.btnSave}`} disabled={isFormInvalid || isSaving}>
                  {isSaving ? "Salvando..." : "Salvar e Adicionar Outro"} <i className="fas fa-plus"></i>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimalModal;