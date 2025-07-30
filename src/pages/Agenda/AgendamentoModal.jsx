// src/pages/Agenda/AgendamentoModal.jsx

import React, { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./AgendamentoModal.module.css";

function AgendamentoModal({ isOpen, onClose, onSave, selectedDate }) {
  // Estados para as listas dos dropdowns
  const [tutores, setTutores] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [horarios, setHorarios] = useState([]);

  // Estados para os valores selecionados no formulário
  const [idTutor, setIdTutor] = useState("");
  const [idAnimal, setIdAnimal] = useState("");
  const [idVeterinario, setIdVeterinario] = useState("");
  const [dia, setDia] = useState("");
  const [horario, setHorario] = useState("");
  const [error, setError] = useState("");

  // Efeito para buscar dados iniciais (tutores e veterinários) quando o modal abre
  useEffect(() => {
    if (isOpen) {
      // Limpa estados antigos ao abrir
      setIdTutor("");
      setIdAnimal("");
      setIdVeterinario("");
      setHorario("");
      setError("");
      setDia(selectedDate || ""); // Preenche a data se o usuário clicou em um dia

      // Busca listas
      api.get("/tutores").then((res) => setTutores(res || []));
      api.get("/veterinarios").then((res) => setVeterinarios(res || []));
      setDia(selectedDate ? selectedDate.split('T')[0] : '');

    }
  }, [isOpen, selectedDate]);

  // Efeito para buscar os animais do tutor selecionado
  useEffect(() => {
    if (idTutor) {
      // ATENÇÃO: Precisamos de uma rota no backend para isso! (ver nota no final)
      api
        .get(`/tutores/${idTutor}/animais`)
        .then((res) => setAnimais(res || []));
    } else {
      setAnimais([]); // Limpa a lista de animais se nenhum tutor for selecionado
    }
  }, [idTutor]);

  // Efeito para buscar horários disponíveis
  useEffect(() => {
    if (idVeterinario && dia) {
      api
        .get(
          `/agendamentos/horarios-disponiveis?id_veterinario=${idVeterinario}&dia=${dia}`
        )
        .then((res) => setHorarios(res || []));
    } else {
      setHorarios([]);
    }
  }, [idVeterinario, dia]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idTutor || !idAnimal || !idVeterinario || !dia || !horario) {
      setError("Todos os campos são obrigatórios.");
      return;
    }
    const id_usuario = localStorage.getItem("user_id"); // Pega o ID do usuário logado

    try {
      const agendamentoData = {
        id_tutor: parseInt(idTutor),
        id_animal: parseInt(idAnimal),
        id_veterinario: parseInt(idVeterinario),
        dia,
        horario,
        id_usuario: parseInt(id_usuario),
      };
      await api.post("/agendamentos", agendamentoData);
      onSave(); // Avisa o componente pai para recarregar o calendário
    } catch (err) {
      setError(err.message || "Erro ao criar agendamento.");
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Novo Agendamento</h2>
        <form
          id="agendamento-form"
          onSubmit={handleSubmit}
          className={styles.formBody}
        >
          <div className={styles.formGroup}>
            <label>Tutor</label>
            <select
              value={idTutor}
              onChange={(e) => {
                setIdTutor(e.target.value);
                setIdAnimal("");
              }}
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
            <label>Animal</label>
            <select
              value={idAnimal}
              onChange={(e) => setIdAnimal(e.target.value)}
              disabled={!idTutor}
            >
              <option value="">Selecione um animal</option>
              {animais.map((animal) => (
                <option key={animal.id_animal} value={animal.id_animal}>
                  {animal.nome}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Veterinário</label>
            <select
              value={idVeterinario}
              onChange={(e) => setIdVeterinario(e.target.value)}
            >
              <option value="">Selecione um veterinário</option>
              {veterinarios.map((vet) => (
                <option key={vet.id_veterinario} value={vet.id_veterinario}>
                  {vet.nome}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Dia</label>
            <input
              type="date"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Horário</label>
            <select
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              disabled={!idVeterinario || !dia}
            >
              <option value="">Selecione um horário</option>
              {horarios.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
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
            form="agendamento-form"
            className={styles.saveButton}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgendamentoModal;
