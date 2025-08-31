// src/pages/Tutores/TutorModal.jsx
import React, { useState, useEffect, useCallback } from "react";
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

  // --- EFEITOS DE BUSCA DE DADOS ---

  // Efeito 1: Busca os estados quando o modal abre.
  useEffect(() => {
    if (isOpen) {
      setLoadingEstados(true);
      setError("");
      api.get("/estados")
        .then(response => {
          // ✅ A CORREÇÃO FINAL ESTÁ AQUI!
          // Usamos 'response' diretamente, pois ele já é o array de estados.
          console.log("Estados carregados com sucesso:", response);
          setEstados(response || []); 
        })
        .catch(() => {
          setError("Falha ao carregar a lista de estados. Verifique a conexão.");
          setEstados([]);
        })
        .finally(() => {
          setLoadingEstados(false);
        });
    }
  }, [isOpen]);

  // Efeito 2: Preenche ou limpa o formulário (sem alterações)
  useEffect(() => {
    if (isOpen) {
      if (tutorToEdit) {
        setNome(tutorToEdit.nome || ""); setCpf(tutorToEdit.cpf || "");
        setTelefone(tutorToEdit.telefone || ""); setDataNasc(tutorToEdit.data_nasc ? new Date(tutorToEdit.data_nasc).toISOString().split("T")[0] : "");
        setCep(tutorToEdit.cep || ""); setRua(tutorToEdit.rua || "");
        setNum(tutorToEdit.num || ""); setBairro(tutorToEdit.bairro || "");
      } else {
        setNome(""); setCpf(""); setTelefone(""); setDataNasc("");
        setCep(""); setRua(""); setNum(""); setBairro("");
      }
      setIdEstado(""); setIdCidade(""); setCidades([]); setError("");
    }
  }, [isOpen, tutorToEdit]);
  
  // Efeito 3: Busca cidades quando um estado é selecionado (sem alterações)
  useEffect(() => {
    if (idEstado) {
      api.get(`/estados/${idEstado}/cidades`)
        .then(response => setCidades(response || [])) // Corrigido para consistência
        .catch(() => setError("Falha ao carregar cidades."));
    } else {
      setCidades([]);
    }
  }, [idEstado]);

  // --- MANIPULADORES (HANDLERS) --- (sem alterações)
  const handleCepChange = useCallback(async (cepValue) => {
    const formattedCep = cepValue.replace(/\D/g, "");
    setCep(formattedCep);
    setError("");
    if (formattedCep.length !== 8) return;
    setLoadingCep(true);
    try {
      const endereco = await api.get(`/enderecos/cep/${formattedCep}`);
      if (!endereco || !endereco.cidade || !endereco.uf) throw new Error("O CEP não retornou um endereço válido.");
      setRua(endereco.logradouro || ""); setBairro(endereco.bairro || "");
      const estadoEncontrado = estados.find(e => e.uf.trim().toUpperCase() === endereco.uf.trim().toUpperCase());
      if (!estadoEncontrado) throw new Error(`O estado retornado (${endereco.uf}) não foi encontrado no sistema.`);
      setIdEstado(estadoEncontrado.id_estado);
      const cidadesDoEstado = await api.get(`/estados/${estadoEncontrado.id_estado}/cidades`);
      setCidades(cidadesDoEstado || []);
      const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const cidadeEncontrada = cidadesDoEstado.find(c => normalizar(c.nome) === normalizar(endereco.cidade));
      if (cidadeEncontrada) {
        setIdCidade(cidadeEncontrada.id_cidade);
      } else {
        setError("A cidade do CEP não foi encontrada para este estado.");
      }
    } catch (err) {
      setError(err.message || "CEP inválido ou erro de rede.");
      setRua(""); setBairro(""); setIdEstado("");
    } finally {
      setLoadingCep(false);
    }
  }, [estados]);

// src/pages/Tutores/TutorModal.jsx

// ... (resto do seu código, imports e estados)

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(""); // Limpa erros anteriores

  // 1. Validação básica no frontend
  if (!nome || !cpf || !telefone) {
    setError("Os campos Nome, CPF e Telefone são obrigatórios.");
    return;
  }

  // 2. Coleta e formata os dados do formulário para enviar ao backend
  const tutorData = {
    nome,
    cpf,
    telefone,
    // Garante que a data seja enviada no formato ISO ou como null se estiver vazia
    data_nasc: dataNasc ? new Date(dataNasc).toISOString() : null,
    cep,
    // CORREÇÃO: O backend espera 'logradouro', mas o estado se chama 'rua'
    logradouro: rua, 
    num,
    bairro,
    // Garante que o id_cidade seja um número ou undefined
    id_cidade: idCidade ? parseInt(idCidade, 10) : undefined,
  };

  try {
    if (tutorToEdit) {
      // Se estiver editando, usa o método PUT
      await api.put(`/tutores/${tutorToEdit.id_tutor}`, tutorData);
    } else {
      // Se for um novo tutor, usa o método POST
      await api.post("/tutores", tutorData);
    }
    onSave(); // Fecha o modal e atualiza a lista de tutores
  } catch (err) {
    // Exibe a mensagem de erro vinda do backend, se houver
    setError(err.response?.data?.message || "Ocorreu um erro ao salvar o tutor.");
    console.error("Erro ao salvar tutor:", err);
  }
};

if (!isOpen) return null;

// ... (resto da renderização do seu componente)

  if (!isOpen) return null;

  // --- RENDERIZAÇÃO --- (sem alterações)
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{tutorToEdit ? "Editar Tutor" : "Novo Tutor"}</h2>
        <form id="tutor-form" onSubmit={handleSubmit} className={styles.formBody}>
            <div className={styles.formGroup}><label>Nome Completo</label><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
            <div className={styles.formGroup}><label>CPF</label><input type="text" value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))} required /></div>
            <div className={styles.formGroup}><label>Telefone</label><input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} required /></div>
            <div className={styles.formGroup}><label>Data de Nascimento</label><input type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} /></div>
            <div className={styles.formGroup}>
                <label>CEP</label>
                <input type="text" value={cep} onChange={(e) => handleCepChange(e.target.value)} placeholder={loadingEstados ? "Carregando..." : "Apenas números"} maxLength={8} disabled={loadingEstados || loadingCep} />
            </div>
            <div className={styles.formGroup}><label>Estado</label><select value={idEstado} onChange={(e) => { setIdEstado(e.target.value); setIdCidade(""); }} disabled={loadingEstados}><option value="">Selecione</option>{estados.map((e) => (<option key={e.id_estado} value={e.id_estado}>{e.nome}</option>))}</select></div>
            <div className={styles.formGroup}><label>Cidade</label><select value={idCidade} onChange={(e) => setIdCidade(e.target.value)} disabled={!idEstado}><option value="">Selecione</option>{cidades.map((c) => (<option key={c.id_cidade} value={c.id_cidade}>{c.nome}</option>))}</select></div>
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