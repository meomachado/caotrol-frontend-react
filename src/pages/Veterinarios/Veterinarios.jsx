// pages/Veterinarios/Veterinarios.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import styles from './Veterinarios.module.css'; // Usaremos um estilo parecido com o de Tutores
import VeterinarioModal from './VeterinarioModal';

function Veterinarios() {
  const [veterinarios, setVeterinarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVeterinarios = useCallback(async (page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 }).toString();
      const response = await api.getVeterinarios(params);
      setVeterinarios(response.data || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.currentPage || 1);
    } catch (err) {
      setError('Não foi possível carregar os veterinários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVeterinarios(currentPage);
  }, [currentPage, fetchVeterinarios]);

  const handleSave = () => {
    setIsModalOpen(false);
    fetchVeterinarios(1);
  };

  return (
    <div className={styles.container}>
      <VeterinarioModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <div className={styles.header}>
        <h1>Veterinários</h1>
        <button 
            className={styles.newButton}
            onClick={() => setIsModalOpen(true)}
        >
            <i className="fas fa-plus"></i> Novo Veterinário
        </button>
      </div>
      
      <div className={styles.list}>
        {loading && <p>Carregando...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && veterinarios.map((vet) => (
          <div key={vet.id_veterinario} className={styles.item}>
            <div className={styles.info}>
              <h4>{vet.nome}</h4>
              <p>CRMV: {vet.crmv} | CPF: {vet.cpf}</p>
            </div>
            <div className={styles.actions}>
              {/* Botões de editar/excluir podem ser adicionados aqui */}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.paginationControls}>
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || totalPages === 0}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages || 1}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
          Próxima
        </button>
      </div>
    </div>
  );
}

export default Veterinarios;