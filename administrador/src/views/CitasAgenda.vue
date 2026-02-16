<template>
  <admin-layout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Agenda de Citas</h1>
      
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      </div>

      <div v-else class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="custom-calendar">
          <FullCalendar ref="calendarRef" class="min-h-screen" :options="calendarOptions" />
        </div>
      </div>

      <!-- Appointment Detail Modal -->
      <div v-if="selectedAppointment && viewModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeViewModal">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4" @click.stop>
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Detalle de Cita</h2>
            <button @click="closeViewModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</h3>
              <p class="text-gray-900 dark:text-white">{{ selectedAppointment.name }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</h3>
              <p class="text-gray-900 dark:text-white">{{ selectedAppointment.phone }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
              <p class="text-gray-900 dark:text-white">{{ selectedAppointment.email }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha y Hora</h3>
              <p class="text-gray-900 dark:text-white">{{ formatDate(selectedAppointment.date) }} a las {{ selectedAppointment.time }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Motivo</h3>
              <p class="text-gray-900 dark:text-white">{{ selectedAppointment.reason }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</h3>
              <span :class="getStatusClass(selectedAppointment.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ getStatusLabel(selectedAppointment.status) }}
              </span>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              v-if="selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'cancelada'"
              @click="cancelAppointment(selectedAppointment.id)"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Cancelar Cita
            </button>
            <button
              @click="closeViewModal"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AdminLayout from '../components/layout/AdminLayout.vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

const appointments = ref([]);
const calendarEvents = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedAppointment = ref(null);
const viewModalOpen = ref(false);
const calendarRef = ref(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchAppointments = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Fetch all appointments (both active and cancelled)
    const response = await fetch(`${API_URL}/api/appointments/citas`);
    
    if (!response.ok) {
      throw new Error('Error al cargar la agenda');
    }
    
    const activeData = await response.json();
    
    // Also fetch cancelled appointments
    const cancelledResponse = await fetch(`${API_URL}/api/appointments/cancelaciones`);
    const cancelledData = cancelledResponse.ok ? await cancelledResponse.json() : [];
    
    // Combine both arrays
    const allAppointments = [...activeData, ...cancelledData];
    appointments.value = allAppointments;
    
    // Convert appointments to calendar events
    calendarEvents.value = allAppointments.map(apt => ({
      id: apt.id.toString(),
      title: `${apt.name} - ${apt.reason}`,
      start: `${apt.date}T${apt.time}`,
      extendedProps: {
        appointment: apt,
        calendar: getEventColor(apt.status)
      },
      backgroundColor: getEventBackgroundColor(apt.status),
      borderColor: getEventBorderColor(apt.status),
      textColor: '#ffffff'
    }));
    
  } catch (err) {
    console.error('Error fetching appointments:', err);
    error.value = 'Error al cargar la agenda. Por favor, intenta de nuevo.';
  } finally {
    loading.value = false;
  }
};

const getEventColor = (status: any) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'confirmed' || statusLower === 'confirmada') return 'Success';
  if (statusLower === 'pending' || statusLower === 'pendiente') return 'Warning';
  if (statusLower === 'cancelled' || statusLower === 'cancelada') return 'Danger';
  return 'Primary';
};

const getEventBackgroundColor = (status: any) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'confirmed' || statusLower === 'confirmada') return '#10b981';
  if (statusLower === 'pending' || statusLower === 'pendiente') return '#f59e0b';
  if (statusLower === 'cancelled' || statusLower === 'cancelada') return '#ef4444';
  return '#3b82f6';
};

const getEventBorderColor = (status: any) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'confirmed' || statusLower === 'confirmada') return '#059669';
  if (statusLower === 'pending' || statusLower === 'pendiente') return '#d97706';
  if (statusLower === 'cancelled' || statusLower === 'cancelada') return '#dc2626';
  return '#2563eb';
};

const handleEventClick = (clickInfo: any) => {
  const appointment = clickInfo.event.extendedProps.appointment;
  selectedAppointment.value = appointment;
  viewModalOpen.value = true;
};

const closeViewModal = () => {
  viewModalOpen.value = false;
  selectedAppointment.value = null;
};

const cancelAppointment = async (id: any) => {
  if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/appointments/citas/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'cancelada' }),
    });

    if (!response.ok) {
      throw new Error('Error al cancelar la cita');
    }

    // Close modal and refresh
    closeViewModal();
    await fetchAppointments();
  } catch (err) {
    console.error('Error canceling appointment:', err);
    alert('Error al cancelar la cita. Por favor, intenta de nuevo.');
  }
};

const formatDate = (dateString: any) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const getStatusClass = (status: any) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'confirmed' || statusLower === 'confirmada') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  }
  if (statusLower === 'pending' || statusLower === 'pendiente') {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
  }
  if (statusLower === 'cancelled' || statusLower === 'cancelada') {
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

const getStatusLabel = (status: any) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'confirmed') return 'Confirmada';
  if (statusLower === 'pending') return 'Pendiente';
  if (statusLower === 'cancelled') return 'Cancelada';
  return status;
};

const renderEventContent = (eventInfo: any) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return {
    html: `
      <div class="event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm">
        <div class="fc-daygrid-event-dot"></div>
        <div class="fc-event-time">${eventInfo.timeText}</div>
        <div class="fc-event-title">${eventInfo.event.title}</div>
      </div>
    `,
  };
};

const calendarOptions = reactive({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  locale: 'es',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    list: 'Lista'
  },
  events: calendarEvents,
  eventClick: handleEventClick,
  eventContent: renderEventContent,
  height: 'auto',
  firstDay: 1, // Monday
  slotMinTime: '08:00:00',
  slotMaxTime: '20:00:00',
  allDaySlot: false,
});

onMounted(() => {
  fetchAppointments();
});
</script>

<style>
/* FullCalendar custom styles */
.custom-calendar .fc {
  font-family: inherit;
}

.custom-calendar .fc-button {
  @apply bg-blue-500 border-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:border-blue-600 dark:hover:bg-blue-700;
}

.custom-calendar .fc-button-active {
  @apply bg-blue-700 border-blue-700 dark:bg-blue-800 dark:border-blue-800;
}

.custom-calendar .fc-toolbar-title {
  @apply text-gray-900 dark:text-white;
}

.custom-calendar .fc-col-header-cell {
  @apply bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300;
}

.custom-calendar .fc-daygrid-day {
  @apply dark:bg-gray-900;
}

.custom-calendar .fc-daygrid-day-number {
  @apply text-gray-900 dark:text-white;
}

.custom-calendar .fc-day-today {
  @apply bg-blue-50 dark:bg-blue-900/20;
}

.custom-calendar .fc-event {
  @apply cursor-pointer;
}

.fc-bg-success {
  @apply bg-green-500 text-white;
}

.fc-bg-warning {
  @apply bg-yellow-500 text-white;
}

.fc-bg-danger {
  @apply bg-red-500 text-white;
}

.fc-bg-primary {
  @apply bg-blue-500 text-white;
}
</style>
