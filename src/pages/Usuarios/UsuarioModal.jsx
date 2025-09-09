// pages/Usuarios/UsuarioModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './UsuarioModal.module.css';

function UsuarioModal({ isOpen, onClose, onSave }) {
  // ... (estados existentes: login, senha, tipo, idVeterinario)
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('padrao');
  const [idVeterinario, setIdVeterinario] = useState('');

  const [vetsDisponiveis, setVetsDisponiveis] = useState([]); // Novo estado para vets sem login
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Limpa os campos
      setLogin('');
      setSenha('');
      setTipo('padrao');
      setIdVeterinario('');
      setError('');
      
      const fetchVetsDisponiveis = async () => {
        try {
          // Busca todos os veterinários e todos os usuários em paralelo
          const [resVets, resUsers] = await Promise.all([
            api.getVeterinarios('?limit=1000'),
            api.getUsuarios('?limit=1000')
          ]);

          const todosVets = resVets.data || [];
          const todosUsers = resUsers.data || [];

          // Pega os IDs de veterinários que já estão vinculados a um usuário
          const idsVetsVinculados = new Set(
            todosUsers
              .filter(user => user.id_veterinario)
              .map(user => user.id_veterinario)
          );
          
          // Filtra a lista de veterinários, mostrando apenas os que não estão no Set
          const vetsFiltrados = todosVets.filter(vet => !idsVetsVinculados.has(vet.id_veterinario));
          
          setVetsDisponiveis(vetsFiltrados);

        } catch (err) {
          setError('Não foi possível carregar a lista de veterinários.');
        }
      };
      
      fetchVetsDisponiveis();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!login || !senha) {
      setError('Login e Senha são obrigatórios.');
      return;
    }
    if (tipo === 'veterinario' && !idVeterinario) {
      setError('Para usuários do tipo veterinário, é obrigatório associar um perfil.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = {
        login,
        senha,
        tipo,
        id_veterinario: tipo === 'veterinario' ? parseInt(idVeterinario) : null,
      };
      await api.registrarUsuario(payload);
      onSave();
    } catch (err) {
      setError(err.message || 'Erro ao registrar usuário.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Novo Usuário do Sistema</h2>
        <form id="user-form" onSubmit={handleSubmit} className={styles.formBody}>
          {/* Campos de Login, Senha e Tipo continuam iguais */}
          <div className={styles.formGroup}>
            <label>Login de Acesso</label>
            <input type="text" value={login} onChange={e => setLogin(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Senha Provisória</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Tipo de Usuário</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="padrao">Padrão (Recepcionista)</option>
              <option value="veterinario">Veterinário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          {tipo === 'veterinario' && (
            <div className={styles.formGroup}>
              <label>Associar ao Veterinário (Apenas perfis sem login)</label>
              <select value={idVeterinario} onChange={e => setIdVeterinario(e.target.value)} required>
                <option value="">Selecione um veterinário</option>
                {vetsDisponiveis.map(vet => (
                  <option key={vet.id_veterinario} value={vet.id_veterinario}>
                    {vet.nome} - {vet.crmv}
                  </option>
                ))}
              </select>
              {vetsDisponiveis.length === 0 && <p className={styles.infoText}>Nenhum novo perfil de veterinário disponível para vincular.</p>}
            </div>
          )}

        </form>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
          <button type="submit" form="user-form" className={styles.saveButton} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Usuário'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UsuarioModal;