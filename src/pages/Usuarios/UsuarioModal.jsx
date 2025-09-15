// src/pages/Usuarios/UsuarioModal.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./SharedModal.module.css";
import { FaUserCircle, FaShieldAlt, FaUser, FaEnvelope, FaKey, FaTimes, FaCheck } from 'react-icons/fa';

function UsuarioModal({ isOpen, onClose, onSave, initialData }) {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("padrao");
  const [idVeterinario, setIdVeterinario] = useState("");
  const [vetsDisponiveis, setVetsDisponiveis] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    const fetchVetsDisponiveis = async () => {
      try {
        const [resVets, resUsers] = await Promise.all([
          api.getVeterinarios("limit=1000"),
          api.getUsuarios("limit=1000"),
        ]);
        const todosVets = resVets.data || [];
        const todosUsers = resUsers.data || [];
        const idsVetsVinculados = new Set(
          todosUsers
            .filter((user) => user.id_veterinario)
            .map((user) => user.id_veterinario)
        );
        const vetsFiltrados = todosVets.filter(
          (vet) => !idsVetsVinculados.has(vet.id_veterinario)
        );
        setVetsDisponiveis(vetsFiltrados);
      } catch (err) {
        setError("Não foi possível carregar a lista de veterinários disponíveis.");
      }
    };

    if (isOpen) {
      if (isEditing) {
        setLogin(initialData.login || '');
        setEmail(initialData.email || '');
        setTipo(initialData.tipo || 'padrao');
      } else {
        setLogin("");
        setEmail("");
        setTipo("padrao");
        setIdVeterinario("");
        fetchVetsDisponiveis();
      }
      setSenha("");
      setError("");
    }
  }, [isOpen, initialData, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!login || !email) {
      setError("Login e Email são obrigatórios.");
      return;
    }
    if (!isEditing && !senha) {
      setError("A senha é obrigatória para novos usuários.");
      return;
    }
    if (!isEditing && tipo === 'veterinario' && !idVeterinario) {
      setError("É obrigatório selecionar um perfil de veterinário para associar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = { login, email, tipo };
      if (senha) payload.senha = senha;
      
      if (isEditing) {
        await api.updateUsuario(initialData.id_usuario, payload);
      } else {
        if (tipo === 'veterinario') {
          payload.id_veterinario = parseInt(idVeterinario);
        }
        await api.registrarUsuario(payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erro ao salvar usuário.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{isEditing ? 'Editar Usuário' : 'Novo Usuário do Sistema'}</h2>
        </div>
        <form id="user-form" onSubmit={handleSubmit} className={styles.formBody}>
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}><FaUserCircle />Credenciais</h3>
              <div className={styles.formGroup}>
                <label>Login de Acesso</label>
                <div className={styles.inputIconWrapper}>
                  <FaUser />
                  <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} required />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <div className={styles.inputIconWrapper}>
                  <FaEnvelope />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}><FaShieldAlt />Segurança e Permissões</h3>
              <div className={styles.formGroup}>
                <label>{isEditing ? 'Nova Senha (Opcional)' : 'Senha'}</label>
                <div className={styles.inputIconWrapper}>
                  <FaKey />
                  <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required={!isEditing} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Tipo de Usuário</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={isEditing}>
                  <option value="padrao">Padrão (Recepcionista)</option>
                  <option value="veterinario">Veterinário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {!isEditing && tipo === "veterinario" && (
                <div className={styles.formGroup}>
                  <label>Associar ao Perfil</label>
                  <select
                    value={idVeterinario}
                    onChange={(e) => setIdVeterinario(e.target.value)}
                    required
                  >
                    <option value="">Selecione um veterinário...</option>
                    {vetsDisponiveis.map((vet) => (
                      <option key={vet.id_veterinario} value={vet.id_veterinario}>
                        {vet.nome} - {vet.crmv}
                      </option>
                    ))}
                  </select>
                  {vetsDisponiveis.length === 0 && (
                    <p style={{fontSize: '0.8em', color: '#7f8c8d', textAlign: 'center'}}>
                      Nenhum novo perfil de veterinário para vincular.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
        <div className={styles.modalFooter}>
          <div className={styles.errorContainer}>
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnCancel}`}>
              <FaTimes /> Cancelar
            </button>
            <button type="submit" form="user-form" className={`${styles.btn} ${styles.btnSave}`} disabled={loading}>
              <FaCheck /> {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsuarioModal;