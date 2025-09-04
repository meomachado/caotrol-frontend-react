import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api";
import styles from "./TutorModal.module.css";

function TutorModal({ isOpen, onClose, onSave, tutorToEdit }) {
  // --- ESTADOS DO FORMULÁRIO ---
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [num, setNum] = useState("");
  const [bairro, setBairro] = useState("");
  const [idEstado, setIdEstado] = useState("");
  const [idCidade, setIdCidade] = useState("");

  // --- ESTADOS DE DADOS E UI ---
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [error, setError] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [filtroCidade, setFiltroCidade] = useState("");
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const cidadeWrapperRef = useRef(null);

  // Efeito 1: Busca a lista de todos os estados (sem alteração)
  useEffect(() => {
    if (isOpen) {
      setLoadingEstados(true);
      api
        .get("/estados")
        .then((response) => {
          setEstados(response || []);
        })
        .catch(() => setError("Falha ao carregar lista de estados."))
        .finally(() => setLoadingEstados(false));
    }
  }, [isOpen]);

  // Efeito 2 (CORRIGIDO): Lógica ÚNICA para preencher ou limpar o formulário
  useEffect(() => {
    const carregarDados = async () => {
      // Limpa tudo antes de começar, garantindo um estado limpo
      setNome("");
      setCpf("");
      setTelefone("");
      setDataNasc("");
      setCep("");
      setRua("");
      setNum("");
      setBairro("");
      setIdEstado("");
      setIdCidade("");
      setFiltroCidade("");
      setCidades([]);
      setError("");

      if (tutorToEdit) {
        // MODO EDIÇÃO: Preenche os campos
        setNome(tutorToEdit.nome || "");
        setCpf(tutorToEdit.cpf || "");
        setTelefone(tutorToEdit.telefone || "");
        setDataNasc(
          tutorToEdit.data_nasc
            ? new Date(tutorToEdit.data_nasc).toISOString().split("T")[0]
            : ""
        );
        setCep(tutorToEdit.cep || "");
        setRua(tutorToEdit.logradouro || "");
        setNum(tutorToEdit.num || "");
        setBairro(tutorToEdit.bairro || "");

        // Lógica para preencher estado e cidade
        if (tutorToEdit.cidade && tutorToEdit.cidade.estado) {
          const estadoId = tutorToEdit.cidade.estado.id_estado;
          setIdEstado(estadoId);

          try {
            const response = await api.get(`/estados/${estadoId}/cidades`);
            setCidades(response || []);
            setFiltroCidade(tutorToEdit.cidade.nome);
            setIdCidade(tutorToEdit.id_cidade);
          } catch (err) {
            setError("Falha ao carregar a cidade do tutor.");
          }
        }
      }
    };

    if (isOpen) {
      carregarDados();
    }
  }, [isOpen, tutorToEdit]);

  // Efeito 3: Detecta clique fora para fechar sugestões (sem alteração)
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        cidadeWrapperRef.current &&
        !cidadeWrapperRef.current.contains(event.target)
      ) {
        setMostrarSugestoes(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cidadeWrapperRef]);

  // Handler para quando o USUÁRIO troca o estado manualmente
  const handleEstadoChange = async (e) => {
    const novoEstadoId = e.target.value;
    setIdEstado(novoEstadoId);

    // Limpa a cidade para nova seleção
    setIdCidade("");
    setFiltroCidade("");
    setCidades([]);

    if (novoEstadoId) {
      try {
        const response = await api.get(`/estados/${novoEstadoId}/cidades`);
        setCidades(response || []);
      } catch (err) {
        setError("Falha ao carregar cidades para este estado.");
      }
    }
  };

  // O restante do código (handleCepChange, handleSubmit, etc.) continua igual.
  const handleCepChange = useCallback(
    async (cepValue) => {
      const formattedCep = cepValue.replace(/\D/g, "");
      setCep(formattedCep);
      setError("");
      if (formattedCep.length !== 8) return;
      setLoadingCep(true);
      try {
        const endereco = await api.get(`/enderecos/cep/${formattedCep}`);
        setRua(endereco.logradouro || "");
        setBairro(endereco.bairro || "");
        const estadoEncontrado = estados.find(
          (e) => e.uf.toUpperCase() === endereco.uf.toUpperCase()
        );
        if (estadoEncontrado) {
          setIdEstado(estadoEncontrado.id_estado);
          const cidadesDoEstado = await api.get(
            `/estados/${estadoEncontrado.id_estado}/cidades`
          );
          setCidades(cidadesDoEstado || []);
          const cidadeEncontrada = cidadesDoEstado.find(
            (c) => c.nome.toLowerCase() === endereco.cidade.toLowerCase()
          );
          if (cidadeEncontrada) {
            setIdCidade(cidadeEncontrada.id_cidade);
            setFiltroCidade(cidadeEncontrada.nome);
          } else {
            setFiltroCidade(endereco.cidade);
            setError("A cidade do CEP não foi encontrada no sistema.");
          }
        } else {
          setError("O estado do CEP não foi encontrado no sistema.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "CEP inválido ou não encontrado."
        );
        setRua("");
        setBairro("");
        setIdEstado("");
      } finally {
        setLoadingCep(false);
      }
    },
    [estados]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!nome || !cpf || !telefone) {
      setError("Os campos Nome, CPF e Telefone são obrigatórios.");
      return;
    }
    const tutorData = {
      nome,
      cpf,
      telefone,
      data_nasc: dataNasc ? new Date(dataNasc).toISOString() : null,
      cep,
      logradouro: rua,
      num,
      bairro,
      id_cidade: idCidade ? parseInt(idCidade, 10) : undefined,
    };
    try {
      if (tutorToEdit) {
        await api.put(`/tutores/${tutorToEdit.id_tutor}`, tutorData);
      } else {
        await api.post("/tutores", tutorData);
      }
      onSave();
    } catch (err) {
      setError(
        err.response?.data?.message || "Ocorreu um erro ao salvar o tutor."
      );
    }
  };

  const cidadesFiltradas = filtroCidade
    ? cidades.filter((cidade) =>
        cidade.nome.toLowerCase().includes(filtroCidade.toLowerCase())
      )
    : cidades;

  const handleCidadeSelect = (cidade) => {
    setIdCidade(cidade.id_cidade);
    setFiltroCidade(cidade.nome);
    setMostrarSugestoes(false);
  };

  const handleFiltroCidadeChange = (e) => {
    setFiltroCidade(e.target.value);
    setIdCidade("");
    setMostrarSugestoes(true);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{tutorToEdit ? "Editar Tutor" : "Novo Tutor"}</h2>
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
            <label>CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) =>
                setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))
              }
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Telefone</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
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
            <label>CEP</label>
            <input
              type="text"
              value={cep}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="Apenas números"
              maxLength={8}
              disabled={loadingEstados || loadingCep}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Estado</label>
            <select
              value={idEstado}
              onChange={handleEstadoChange}
              disabled={loadingEstados}
            >
              <option value="">Selecione</option>
              {estados.map((e) => (
                <option key={e.id_estado} value={e.id_estado}>
                  {e.nome}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup} ref={cidadeWrapperRef}>
            <label>Cidade</label>
            <div className={styles.cidadeInputContainer}>
              <input
                type="text"
                placeholder="Digite o nome da cidade"
                value={filtroCidade}
                onChange={handleFiltroCidadeChange}
                onFocus={() => setMostrarSugestoes(true)}
                disabled={!idEstado}
              />
              {mostrarSugestoes && cidadesFiltradas.length > 0 && (
                <ul className={styles.sugestoesLista}>
                  {cidadesFiltradas.map((cidade) => (
                    <li
                      key={cidade.id_cidade}
                      onClick={() => handleCidadeSelect(cidade)}
                      className={styles.sugestoesItem}
                    >
                      {cidade.nome}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Rua</label>
            <input
              type="text"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Bairro</label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Número</label>
            <input
              type="text"
              value={num}
              onChange={(e) => setNum(e.target.value)}
            />
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
          <button type="submit" form="tutor-form" className={styles.saveButton}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorModal;
