// pages/Tutores/TutorModal.jsx
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

  // --- ESTADOS DE UI E VALIDAÇÃO ---
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [error, setError] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filtroCidade, setFiltroCidade] = useState("");
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [validation, setValidation] = useState({ cpf: true, telefone: true });

  // --- REFS PARA UX ---
  const nomeInputRef = useRef(null);
  const cidadeWrapperRef = useRef(null);

  // --- LÓGICA DE VALIDAÇÃO ---
  const isFormInvalid = !nome || !validation.cpf || !validation.telefone;

  const validateField = (name, value) => {
    if (name === "cpf") {
      setValidation((v) => ({ ...v, cpf: value.length === 14 }));
    }
    if (name === "telefone") {
      setValidation((v) => ({ ...v, telefone: value.length >= 14 }));
    }
  };

  // --- FUNÇÕES DE MÁSCARA ---
  const formatTelefone = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value;
  };
  const formatCPF = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value;
  };

  // --- HANDLERS ---
  const handleTelefoneChange = (e) => {
    const { name, value } = e.target;
    setTelefone(formatTelefone(value));
    validateField(name, formatTelefone(value));
  };
  const handleCpfChange = (e) => {
    const { name, value } = e.target;
    setCpf(formatCPF(value));
    validateField(name, formatCPF(value));
  };

  // ✅ --- FUNÇÃO QUE ESTAVA FALTANDO ---
  const handleEstadoChange = async (e) => {
    const novoEstadoId = e.target.value;
    setIdEstado(novoEstadoId);
    // Limpa a cidade para uma nova seleção
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

  // --- EFEITOS DE CICLO DE VIDA (UX) ---
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

  // Carregar dados iniciais e para edição
  useEffect(() => {
    const carregarDados = async () => {
      api.get("/estados").then((response) => setEstados(response || []));
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
      setValidation({ cpf: true, telefone: true });

      if (tutorToEdit) {
        setNome(tutorToEdit.nome || "");
        const formattedCpf = formatCPF(tutorToEdit.cpf || "");
        const formattedTel = formatTelefone(tutorToEdit.telefone || "");
        setCpf(formattedCpf);
        setTelefone(formattedTel);
        setValidation({
          cpf: formattedCpf.length === 14,
          telefone: formattedTel.length >= 14,
        });
        setDataNasc(
          tutorToEdit.data_nasc
            ? new Date(tutorToEdit.data_nasc).toISOString().split("T")[0]
            : ""
        );
        setCep(tutorToEdit.cep || "");
        setRua(tutorToEdit.logradouro || "");
        setNum(tutorToEdit.num || "");
        setBairro(tutorToEdit.bairro || "");

        if (tutorToEdit.cidade && tutorToEdit.cidade.estado) {
          const estadoId = tutorToEdit.cidade.estado.id_estado;
          setIdEstado(estadoId);
          const response = await api.get(`/estados/${estadoId}/cidades`);
          setCidades(response || []);
          setFiltroCidade(tutorToEdit.cidade.nome);
          setIdCidade(tutorToEdit.id_cidade);
        }
      }
    };
    if (isOpen) carregarDados();
  }, [isOpen, tutorToEdit]);

  // Lógica de busca de CEP
  const handleCepChange = useCallback(
    async (cepValue) => {
      const formattedCep = cepValue.replace(/\D/g, "");
      setCep(formattedCep);
      setError("");
      if (formattedCep.length !== 8) return;
      setLoadingCep(true);
      setRua("");
      setBairro("");
      setIdEstado("");
      setFiltroCidade("");
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
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "CEP inválido ou não encontrado."
        );
      } finally {
        setLoadingCep(false);
      }
    },
    [estados]
  );

  // Navegação por teclado na lista de cidades
  const handleCidadeKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) =>
        prev < cidadesFiltradas.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && highlightedIndex > -1) {
      e.preventDefault();
      handleCidadeSelect(cidadesFiltradas[highlightedIndex]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormInvalid) {
      setError("Verifique os campos obrigatórios.");
      return;
    }
    setIsSaving(true);
    setError("");
    const tutorData = {
      nome,
      cpf: cpf.replace(/\D/g, ""),
      telefone: telefone.replace(/\D/g, ""),
      data_nasc: dataNasc ? new Date(dataNasc).toISOString() : null,
      cep: cep.replace(/\D/g, ""),
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
    } finally {
      setIsSaving(false);
    }
  };

  const cidadesFiltradas = filtroCidade
    ? cidades.filter((cidade) =>
        cidade.nome.toLowerCase().includes(filtroCidade.toLowerCase())
      )
    : [];

  const handleCidadeSelect = (cidade) => {
    setIdCidade(cidade.id_cidade);
    setFiltroCidade(cidade.nome);
    setMostrarSugestoes(false);
    setHighlightedIndex(-1);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{tutorToEdit ? "Editar Tutor" : "Novo Tutor"}</h2>
        </div>

        <form
          id="tutor-form"
          onSubmit={handleSubmit}
          className={styles.formBody}
        >
          <div className={styles.leftPanel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Dados Pessoais</h3>
              <div className={styles.formGroup}>
                <label htmlFor="nome">Nome Completo</label>
                <div className={styles.inputIconWrapper}>
                  <i className="fas fa-user"></i>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    ref={nomeInputRef}
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cpf">CPF</label>
                <div
                  className={`${styles.inputIconWrapper} ${
                    !validation.cpf ? styles.invalid : ""
                  }`}
                >
                  <i className="fas fa-id-card"></i>
                  <input
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={cpf}
                    onChange={handleCpfChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    maxLength="14"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="telefone">Telefone</label>
                <div
                  className={`${styles.inputIconWrapper} ${
                    !validation.telefone ? styles.invalid : ""
                  }`}
                >
                  <i className="fas fa-phone"></i>
                  <input
                    id="telefone"
                    name="telefone"
                    type="text"
                    value={telefone}
                    onChange={handleTelefoneChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    maxLength="15"
                    placeholder="(XX) XXXXX-XXXX"
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="dataNasc">Data de Nascimento</label>
                <div className={styles.inputIconWrapper}>
                  <i className="fas fa-calendar-alt"></i>
                  <input
                    id="dataNasc"
                    type="date"
                    value={dataNasc}
                    onChange={(e) => setDataNasc(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Endereço</h3>

              {/* ✅ MUDANÇA AQUI: Novo grid para CEP e Estado */}
              <div className={styles.locationGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="cep">CEP</label>
                  <div
                    className={`${styles.inputIconWrapper} ${styles.cepContainer}`}
                  >
                    <i className="fas fa-map-marker-alt"></i>
                    <input
                      id="cep"
                      type="text"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={8}
                    />
                    {loadingCep && <div className={styles.spinner}></div>}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="estado">Estado</label>
                  <select
                    id="estado"
                    value={idEstado}
                    onChange={handleEstadoChange}
                  >
                    <option value="">Selecione...</option>
                    {estados.map((e) => (
                      <option key={e.id_estado} value={e.id_estado}>
                        {e.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ✅ Campo Cidade agora ocupa a linha inteira */}
              <div className={styles.formGroup} ref={cidadeWrapperRef}>
                <label htmlFor="cidade">Cidade</label>
                <div className={styles.cidadeInputContainer}>
                  <input
                    id="cidade"
                    type="text"
                    placeholder="Digite para buscar..."
                    value={filtroCidade}
                    onChange={(e) => setFiltroCidade(e.target.value)}
                    onFocus={() => setMostrarSugestoes(true)}
                    onKeyDown={handleCidadeKeyDown}
                    disabled={!idEstado}
                  />
                  {mostrarSugestoes && cidadesFiltradas.length > 0 && (
                    <ul className={styles.sugestoesLista}>
                      {cidadesFiltradas.map((cidade, index) => (
                        <li
                          key={cidade.id_cidade}
                          onClick={() => handleCidadeSelect(cidade)}
                          className={`${styles.sugestoesItem} ${
                            index === highlightedIndex ? styles.highlighted : ""
                          }`}
                        >
                          {cidade.nome}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className={styles.addressGrid}>
                <div
                  className={styles.formGroup}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <label htmlFor="rua">Rua</label>
                  {loadingCep ? (
                    <div className={styles.skeleton}></div>
                  ) : (
                    <input
                      id="rua"
                      type="text"
                      value={rua}
                      onChange={(e) => setRua(e.target.value)}
                    />
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="bairro">Bairro</label>
                  {loadingCep ? (
                    <div className={styles.skeleton}></div>
                  ) : (
                    <input
                      id="bairro"
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                    />
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="num">Número</label>
                  <input
                    id="num"
                    type="text"
                    value={num}
                    onChange={(e) => setNum(e.target.value)}
                  />
                </div>
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
              form="tutor-form"
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

export default TutorModal;
