import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import styles from "./TutorModal.module.css";

function TutorModal({ isOpen, onClose, onSave, tutorToEdit }) {
  // Estados do formulário
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

  // Estados para as listas dos dropdowns
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);

  // Controle de loading e erros
  const [error, setError] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);

  // Busca a lista de estados quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      api.get("/estados")
        .then(response => {
          setEstados(response || []);
        })
        .catch(() => setError("Não foi possível carregar os estados."));
    }
  }, [isOpen]);

  // Preenche o formulário ao editar um tutor
  useEffect(() => {
    if (isOpen) {
      if (tutorToEdit) {
        setNome(tutorToEdit.nome || "");
        setCpf(tutorToEdit.cpf || "");
        setTelefone(tutorToEdit.telefone || "");
        setDataNasc(
          tutorToEdit.data_nasc
            ? new Date(tutorToEdit.data_nasc).toISOString().split("T")[0]
            : ""
        );
        setCep(tutorToEdit.cep || "");
        setRua(tutorToEdit.rua || "");
        setNum(tutorToEdit.num || "");
        setBairro(tutorToEdit.bairro || "");
        // Nota: A seleção de estado/cidade não é preenchida automaticamente
        // para evitar complexidade adicional na carga inicial.
        // O usuário precisará selecionar novamente se quiser alterar.
      } else {
        // Limpa todos os campos ao criar um novo tutor
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
        setCidades([]);
      }
      setError("");
    }
  }, [isOpen, tutorToEdit]);

  // Busca as cidades sempre que um estado é selecionado
  useEffect(() => {
    if (idEstado) {
      api.get(`/estados/${idEstado}/cidades`)
        .then(response => {
          setCidades(response || []);
        })
        .catch(() => setError("Não foi possível carregar as cidades."));
    } else {
      setCidades([]); // Limpa as cidades se nenhum estado estiver selecionado
    }
  }, [idEstado]);

  // Busca o endereço pelo CEP
  const handleCepChange = useCallback(async (cepValue) => {
    const formattedCep = cepValue.replace(/\D/g, "");
    setCep(formattedCep);

    if (formattedCep.length === 8) {
      setLoadingCep(true);
      setError("");
      try {
        const data = await api.get(`/enderecos/cep/${formattedCep}`);
        setRua(data.logradouro);
        setBairro(data.bairro);

        const estadoEncontrado = estados.find(e => e.uf === data.uf);
        if (estadoEncontrado) {
          setIdEstado(estadoEncontrado.id_estado);
          
          // Precisamos buscar as cidades do estado e então selecionar a cidade correta
          const cidadesDoEstado = await api.get(`/estados/${estadoEncontrado.id_estado}/cidades`);
          const cidadeEncontrada = cidadesDoEstado.find(c => c.nome === data.cidade);
          if (cidadeEncontrada) {
            setIdCidade(cidadeEncontrada.id_cidade);
          }
        }
      } catch (err) {
        setError("CEP não encontrado ou inválido.");
        setRua("");
        setBairro("");
      } finally {
        setLoadingCep(false);
      }
    }
  }, [estados]); // Depende da lista de estados para funcionar

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nome || !cpf || !telefone) {
      setError("Nome, CPF e Telefone são obrigatórios.");
      return;
    }

    const tutorData = {
      nome,
      cpf,
      telefone,
      data_nasc: dataNasc ? new Date(dataNasc).toISOString() : null,
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
      setError(err.message || "Erro ao salvar o tutor.");
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
        <form id="tutor-form" onSubmit={handleSubmit} className={styles.formBody}>
          {/* Campos de Dados Pessoais */}
          <div className={styles.formGroup}><label>Nome Completo</label><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
          <div className={styles.formGroup}><label>CPF</label><input type="text" value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))} required /></div>
          <div className={styles.formGroup}><label>Telefone</label><input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} required /></div>
          <div className={styles.formGroup}><label>Data de Nascimento</label><input type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} /></div>
          
          {/* Campos de Endereço */}
          <div className={styles.formGroup}><label>CEP</label><input type="text" value={cep} onChange={(e) => handleCepChange(e.target.value)} placeholder={loadingCep ? "Buscando..." : "Apenas números"} maxLength={8} /></div>
          <div className={styles.formGroup}><label>Estado</label><select value={idEstado} onChange={(e) => { setIdEstado(e.target.value); setIdCidade(""); }}><option value="">Selecione um estado</option>{estados.map((estado) => (<option key={estado.id_estado} value={estado.id_estado}>{estado.nome}</option>))}</select></div>
          <div className={styles.formGroup}><label>Cidade</label><select value={idCidade} onChange={(e) => setIdCidade(e.target.value)} disabled={!idEstado}><option value="">Selecione uma cidade</option>{cidades.map((cidade) => (<option key={cidade.id_cidade} value={cidade.id_cidade}>{cidade.nome}</option>))}</select></div>
          <div className={styles.formGroup}><label>Rua</label><input type="text" value={rua} onChange={(e) => setRua(e.target.value)} /></div>
          <div className={styles.formGroup}><label>Bairro</label><input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} /></div>
          <div className={styles.formGroup}><label>Número</label><input type="text" value={num} onChange={(e) => setNum(e.target.value)} /></div>
        </form>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.modalActions}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
          <button type="submit" form="tutor-form" className={styles.saveButton}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

export default TutorModal;