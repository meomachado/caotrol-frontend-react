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

  // CORREÇÃO FINAL: Função refatorada para usar async/await
  // Este é o método mais moderno e confiável para buscar dados.
  const fetchEvents = async (fetchInfo) => {
    try {
      const url = `/agendamentos?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`;
      console.log("URL da requisição para a API:", url);

      const response = await api.get(url);
      
      // Acessa a propriedade 'data' da resposta da API.
      const events = Array.isArray(response) ? response : [];
      
      console.log("Eventos sendo retornados para o FullCalendar:", events);
      
      // Com async/await, retornamos o array de eventos diretamente.
      return events;
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      // Retorna um array vazio em caso de erro para não quebrar a agenda.
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

  const handleStartConsultaFromAgenda = (animalId) => {
    setAnimalIdParaConsulta(animalId);
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
          events={fetchEvents}
          locale="pt-br"
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
          slotMinTime={"06:00:00"}
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