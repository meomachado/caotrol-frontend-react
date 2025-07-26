// src/pages/Agenda/Agenda.jsx

import React, { useState } from "react"; // Adicione useState
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // 1. IMPORTE O NOVO PLUGIN
import styles from "./Agenda.module.css";
import timeGridPlugin from "@fullcalendar/timegrid";

function Agenda() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (arg) => {
    // alert('Você clicou no dia: ' + arg.dateStr);
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
    console.log("Abrindo modal para novo agendamento no dia:", arg.dateStr);
  };

  // Esta função será chamada quando o usuário clicar em um agendamento existente
  const handleEventClick = (arg) => {
    // alert('Evento clicado: ' + arg.event.title + '\nID do agendamento: ' + arg.event.id);

    console.log("Mostrando detalhes do agendamento:", arg.event);
  };

  const handleOpenCreateModal = () => {
    setSelectedDate(null); // Abre o modal sem uma data pré-selecionada
    setIsModalOpen(true);
    console.log(
      "Abrindo modal para novo agendamento (sem data pré-selecionada)"
    );
  };

  return (
    <div className={styles.agendaContainer}>
      <div className={styles.actionsBar}>
        <h1>Agenda de Consultas</h1>
        <button className={styles.newButton} onClick={handleOpenCreateModal}>
          <i className="fas fa-plus"></i> Novo Agendamento
        </button>
      </div>

      <div className={styles.calendarWrapper}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events="/api/agendamentos"
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
