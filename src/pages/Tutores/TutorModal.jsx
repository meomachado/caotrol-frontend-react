// src/pages/Tutores/TutorModal.jsx

import React, { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./TutorModal.module.css";

function TutorModal({ isOpen, onClose, onSave, tutorToEdit }) {
  // 1. Adicionar estados para os novos campos
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [num, setNum] = useState("");
  const [bairro, setBairro] = useState("");
  // Para id_cidade, um input simples por enquanto. O ideal seria um <select> com uma lista de cidades.
  const [idCidade, setIdCidade] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (tutorToEdit) {
        // 2. Preencher todos os campos ao editar
        setNome(tutorToEdit.nome || "");
        setCpf(tutorToEdit.cpf || "");
        setTelefone(tutorToEdit.telefone || "");
        // Formata a data para o input type="date" (YYYY-MM-DD)
        setDataNasc(
          tutorToEdit.data_nasc
            ? new Date(tutorToEdit.data_nasc).toISOString().split("T")[0]
            : ""
        );
        setCep(tutorToEdit.cep || "");
        setRua(tutorToEdit.rua || "");
        setNum(tutorToEdit.num || "");
        setBairro(tutorToEdit.bairro || "");
        setIdCidade(tutorToEdit.id_cidade || "");
      } else {
        // Limpar todos os campos ao criar novo
        setNome("");
        setCpf("");
        setTelefone("");
        setDataNasc("");
        setCep("");
        setRua("");
        setNum("");
        setBairro("");
      }
      setError("");
    }
  }, [isOpen, tutorToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nome || !cpf || !telefone) {
      setError("Nome, CPF e Telefone são obrigatórios.");
      return;
    }

    // 3. Montar o objeto com todos os dados para a API
    const tutorData = {
      nome,
      cpf,
      telefone,
      data_nasc: dataNasc ? new Date(dataNasc).toISOString() : null, // Envia em formato ISO
      cep,
      rua,
      num,
      bairro,
      id_cidade: idCidade ? parseInt(idCidade) : null,
    };

    try {
      if (tutorToEdit) {
        await api.put(`/tutores/${tutorToEdit.id_tutor}`, tutorData);
      } else {
        await api.post("/tutores", tutorData);
      }
      onSave();
    } catch (err) {
      setError("Erro ao salvar o tutor.");
      console.error(err);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{tutorToEdit ? "Editar Tutor" : "Novo Tutor"}</h2>
        {/* O formulário agora só envolve os campos de input */}
        <form
          id="tutor-form"
          onSubmit={handleSubmit}
          className={styles.formBody}
        >
          <div className={styles.formGroup}>
            <label>Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>CPF</label>{" "}
            <input
              type="text"
              value={cpf}
              onChange={(e) =>
                setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))
              }
              required
            />{" "}
          </div>{" "}
          <div className={styles.formGroup}>
            <label>Telefone</label>{" "}
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />{" "}
          </div>{" "}
          <div className={styles.formGroup}>
            <label>Data de Nascimento</label>{" "}
            <input
              type="date"
              value={dataNasc}
              onChange={(e) => setDataNasc(e.target.value)}
            />{" "}
          </div>{" "}
          <div className={styles.formGroup}>
            <label>CEP</label>{" "}
            <input
              type="text"
              value={cep}
              onChange={(e) =>
                setCep(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              placeholder="Apenas números"
              maxLength={8}
            />{" "}
          </div>{" "}
          <div className={styles.formGroup}>
            <label>Rua</label>{" "}
            <input
              type="text"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
            />{" "}
          </div>{" "}
          <div className={styles.formGroup}>
            <label>Número</label>{" "}
            <input
              type="text"
              value={num}
              onChange={(e) => setNum(e.target.value)}
            />{" "}
          </div>{" "}
          <div className={styles.formGroup}>
            <label>Bairro</label>{" "}
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />{" "}
          </div>{" "}
          <div className={styles.formGroup}>
            {/* TROQUE O LABEL E O ESTADO USADO */}
            <label>ID da Cidade</label>
            <input
              type="number"
              value={idCidade}
              onChange={(e) => setIdCidade(e.target.value)}
            />
          </div>{" "}
        </form>{" "}
        {error && <p className={styles.errorMessage}>{error}</p>}{" "}
        {/* Os botões agora ficam fora do form, no rodapé */}{" "}
        <div className={styles.modalActions}>
          {" "}
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancelar
          </button>{" "}
          {/* O atributo 'form' conecta este botão ao form com o id 'tutor-form' */}{" "}
          <button type="submit" form="tutor-form" className={styles.saveButton}>
            Salvar
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

export default TutorModal;
