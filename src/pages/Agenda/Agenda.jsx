// src/pages/Agenda/Agenda.jsx

import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import styles from "./Agenda.module.css";
import api from "../../services/api"; // Importa nosso 'api.js'
import AgendamentoModal from "./AgendamentoModal";
import AgendamentoDetailModal from "./AgendamentoDetailModal";

function Agenda() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const calendarRef = useRef(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ✅ FUNÇÃO MÁGICA QUE USA NOSSO 'api.js' PARA BUSCAR EVENTOS
  const fetchEvents = (fetchInfo, successCallback, failureCallback) => {
    const url = `/agendamentos?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`;

    api
      .get(url) // Usa o nosso método 'get' que já envia o token
      .then((response) => {
        successCallback(response || []); // Garante que sempre passamos um array
      })
      .catch((error) => {
        console.error("Erro ao buscar agendamentos:", error);
        failureCallback(error);
      });
  };

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event); // Guarda as informações do evento clicado
    setIsDetailModalOpen(true); // Abre o modal de detalhes
  };

  const handleOpenCreateModal = () => {
    setSelectedDate(null);
    setIsModalOpen(true);
  };
  const handleSave = () => {
    // Esta função agora fecha ambos os modais e recarrega a agenda
    setIsModalOpen(false);
    setIsDetailModalOpen(false);
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents();
    }
  };

  return (
    <div className={styles.agendaContainer}>
      <AgendamentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        selectedDate={selectedDate}
      />

      <AgendamentoDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSave={handleSave}
        eventInfo={selectedEvent}
      />

      <div className={styles.actionsBar}>
        <h1>Agenda de Consultas</h1>
        <button className={styles.newButton} onClick={handleOpenCreateModal}>
          <i className="fas fa-plus"></i> Novo Agendamento
        </button>
      </div>

      <div className={styles.calendarWrapper}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          // ✅ AQUI USAMOS A NOSSA FUNÇÃO DE BUSCA
          events={fetchEvents}
          locale="pt-br"
          buttonText={{
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
          }}
          height={800}
          expandRows={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          slotDuration={"01:00:00"}
          slotMinTime={"08:00:00"}
          slotMaxTime={"19:00:00"}
          allDaySlot={false}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
        />
      </div>
    </div>
  );
}

export default Agenda;
