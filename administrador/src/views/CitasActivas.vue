<template>
  <admin-layout>
    <div class="p-6">
    <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Citas Activas</h1>
    
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                #
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nombre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Hora
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Motivo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Usuario
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(appointment, index) in appointments" :key="appointment.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ appointment.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(appointment.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ appointment.time }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {{ appointment.reason }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ appointment.email || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                <button
                  @click="viewAppointment(appointment)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Ver
                </button>
                <button
                  @click="editAppointment(appointment)"
                  class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                >
                  Editar
                </button>
                <button
                  @click="cancelAppointment(appointment.id)"
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  Cancelar
                </button>
              </td>
            </tr>
            <tr v-if="appointments.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No hay citas activas
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- View Modal -->
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
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha</h3>
            <p class="text-gray-900 dark:text-white">{{ formatDate(selectedAppointment.date) }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Hora</h3>
            <p class="text-gray-900 dark:text-white">{{ selectedAppointment.time }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Motivo</h3>
            <p class="text-gray-900 dark:text-white">{{ selectedAppointment.reason }}</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminLayout from '../components/layout/AdminLayout.vue';

const appointments = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedAppointment = ref(null);
const viewModalOpen = ref(false);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchAppointments = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch(`${API_URL}/api/appointments/citas`);
    
    if (!response.ok) {
      throw new Error('Error al cargar las citas');
    }
    
    const data = await response.json();
    appointments.value = data;
  } catch (err) {
    console.error('Error fetching appointments:', err);
    error.value = 'Error al cargar las citas. Por favor, intenta de nuevo.';
  } finally {
    loading.value = false;
  }
};

const viewAppointment = (appointment: any) => {
  selectedAppointment.value = appointment;
  viewModalOpen.value = true;
};

const closeViewModal = () => {
  viewModalOpen.value = false;
  selectedAppointment.value = null;
};

const editAppointment = (appointment: any) => {
  // TODO: Implement edit functionality
  alert(`Editar cita de ${appointment.name} - Funcionalidad pendiente`);
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

    // Refresh the list
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

onMounted(() => {
  fetchAppointments();
});
</script>
