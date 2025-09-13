import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDog, faCat, faPaw } from '@fortawesome/free-solid-svg-icons';

// Este componente recebe o nome da espécie e decide qual ícone mostrar
function EspecieIcon({ especie }) {
  // Deixa o texto em minúsculo para a comparação funcionar sempre
  const especieNormalizada = especie.toLowerCase();

  if (especieNormalizada.includes('canina') || especieNormalizada.includes('cachorro')) {
    return <FontAwesomeIcon icon={faDog} />;
  }
  
  if (especieNormalizada.includes('felina') || especieNormalizada.includes('gato')) {
    return <FontAwesomeIcon icon={faCat} />;
  }

  // Para qualquer outra espécie (ou se não tiver uma), mostra um ícone de patinha
  return <FontAwesomeIcon icon={faPaw} />;
}

export default EspecieIcon;