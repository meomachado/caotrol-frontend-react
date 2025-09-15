import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import styles from "./Agenda.module.css";
import api from "../../services/api";
import AgendamentoModal from "./AgendamentoModal";
import AgendamentoDetailModal from "./AgendamentoDetailModal";
import NovaConsultaModal from "../Consulta/NovaConsultaModal";

function Agenda() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const calendarRef = useRef(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isNovaConsultaOpen, setIsNovaConsultaOpen] = useState(false);
  const [animalIdParaConsulta, setAnimalIdParaConsulta] = useState(null);
  const [agendamentoIdParaConsulta, setAgendamentoIdParaConsulta] = useState(null);

  const fetchEvents = async (fetchInfo) => {
    try {
      const url = `/agendamentos?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`;
      const response = await api.get(url);
      const events = Array.isArray(response) ? response : [];
      return events;
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      return [];
    }
  };

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setIsDetailModalOpen(true);
  };

  const handleStartConsultaFromAgenda = (animalId, agendamentoId) => {
    setAnimalIdParaConsulta(animalId);
    setAgendamentoIdParaConsulta(agendamentoId);
    setIsDetailModalOpen(false);
    setIsNovaConsultaOpen(true);
  };

  const handleOpenCreateModal = () => {
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    setIsDetailModalOpen(false);
    setIsNovaConsultaOpen(false);
    if (calendarRef.current) {
      calendarRef.current.getApi().refetchEvents();
    }
  };

  const statusMap = {
    confirmada: "Confirmada",
    agendada: "Agendada",
    pendente: "Pendente",
    nao_compareceu: "Não Compareceu",
  };

  const renderEventContent = (eventInfo) => {
    const props = eventInfo.event.extendedProps;
    const statusText = props.realizada
      ? "Finalizada"
      : statusMap[props.status] || props.status;

    return (
      <div className={styles.eventBox}>
        <div className={styles.eventTime}>{eventInfo.timeText}</div>
        <div className={styles.eventTitle}>{eventInfo.event.title}</div>
        <div className={styles.eventStatus}>{statusText}</div>
      </div>
    );
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
        onStartConsulta={handleStartConsultaFromAgenda}
      />
      <NovaConsultaModal
        isOpen={isNovaConsultaOpen}
        onClose={() => setIsNovaConsultaOpen(false)}
        onSave={handleSave}
        animalId={animalIdParaConsulta}
        agendamentoId={agendamentoIdParaConsulta}
      />
      <div className={styles.pageHeader}>
        <div>
          <h1>Agenda de Consultas</h1>
        </div>
        <button
          className={styles.actionButtonPrimary}
          onClick={handleOpenCreateModal}
        >
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
          events={fetchEvents}
          locale="pt-br"
          eventContent={renderEventContent}
          timeZone="local"
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
          hiddenDays={[0, 6]} // Oculta domingos
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