import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './TutorDetailPage.module.css';
import EspecieIcon from '../Animais/EspecieIcon';
import AnimalModal from '../Animais/AnimalModal';
import TutorModal from './TutorModal';
import { FaPlus, FaPencilAlt, FaTrashAlt, FaArrowLeft } from 'react-icons/fa';

function TutorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [tutorRes, animaisRes] = await Promise.all([
        api.getTutorById(id),
        api.getAnimaisByTutor(id)
      ]);
      
      setTutor(tutorRes);
      setAnimais(animaisRes || []);

    } catch (err) {
      setError('Não foi possível carregar os dados completos do tutor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este tutor e todos os seus animais? Esta ação não pode ser desfeita.")) {
      try {
        await api.deleteTutor(id);
        alert('Tutor excluído com sucesso.');
        navigate('/tutores');
      } catch (err) {
        setError(err.message || 'Erro ao excluir o tutor.');
      }
    }
  };
  
  const handleSaveAnimal = () => {
    setIsAnimalModalOpen(false);
    fetchData();
  };

  const handleSaveTutor = () => {
    setIsEditModalOpen(false);
    fetchData(); 
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(dateString));
  };
  const formatCPF = (cpf) => cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || '—';
  const formatTelefone = (tel) => tel?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') || '—';

  if (loading) return <div className={styles.statusMessage}>Carregando...</div>;
  if (error) return <div className={`${styles.statusMessage} ${styles.error}`}>{error}</div>;
  if (!tutor) return <div className={styles.statusMessage}>Tutor não encontrado.</div>;

  return (
    <div className={styles.detailPage}>
      <TutorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveTutor}
        tutorToEdit={tutor}
      />
      <AnimalModal
        isOpen={isAnimalModalOpen}
        onClose={() => setIsAnimalModalOpen(false)}
        onSave={handleSaveAnimal}
        tutorToPreselect={tutor}
      />

      <div className={styles.header}>
        <h1>Ficha de <strong>{tutor.nome}</strong></h1>
        <div className={styles.headerActions}>
          <button onClick={() => navigate("/tutores")} className={styles.actionButtonNeutral}>
            <FaArrowLeft /> Voltar
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className={styles.actionButtonPrimary}>
            <FaPencilAlt /> Editar Tutor
          </button>
          <button onClick={handleDelete} className={styles.actionButtonDanger}>
            <FaTrashAlt /> Excluir Tutor
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.tutorInfoCard}>
          <h3 className={styles.sectionTitle}>Dados Pessoais</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}><label>CPF</label><p>{formatCPF(tutor.cpf)}</p></div>
            <div className={styles.detailItem}><label>Telefone</label><p>{formatTelefone(tutor.telefone)}</p></div>
            <div className={styles.detailItem}><label>Nascimento</label><p>{formatDate(tutor.data_nasc)}</p></div>
          </div>
          <h3 className={styles.sectionTitle}>Endereço</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}><label>CEP</label><p>{tutor.cep || '—'}</p></div>
            <div className={styles.detailItem}><label>Cidade/UF</label><p>{tutor.cidade ? `${tutor.cidade.nome} - ${tutor.cidade.estado.uf}` : '—'}</p></div>
            <div className={`${styles.detailItem} ${styles.fullWidth}`}><label>Logradouro</label><p>{`${tutor.logradouro || ''}, ${tutor.num || 'S/N'}`}</p></div>
            <div className={`${styles.detailItem} ${styles.fullWidth}`}><label>Bairro</label><p>{tutor.bairro || '—'}</p></div>
          </div>
        </div>

        <div className={styles.animaisCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.sectionTitle}>Animais</h3>
            <button onClick={() => setIsAnimalModalOpen(true)} className={styles.actionButtonPrimary}>
              <FaPlus /> Adicionar Animal
            </button>
          </div>
          <div className={styles.animalList}>
            {animais.length > 0 ? (
              animais.map(animal => (
                <div key={animal.id_animal} className={styles.animalItem}>
                  <div className={styles.animalInfo}>
                    <div className={styles.animalAvatar}><EspecieIcon especie={animal.raca.especie.nome} /></div>
                    <div>
                      <h4>{animal.nome}</h4>
                      <p>{animal.raca.nome}</p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/animais/${animal.id_animal}`)} className={styles.actionButtonSecondary}>
                    Ver Prontuário
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.noData}>Nenhum animal cadastrado para este tutor.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorDetailPage;