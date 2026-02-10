<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ClipboardCheck } from 'lucide-vue-next';
import HeaderList from './HeaderList.vue';

// URL del API de Backend (Express)
const API_URL = import.meta.env.VITE_API_URL || '/api/citas'; 
// Asegúrate de cambiar esto por tu URL real de producción/test

const citas = ref([]);
const loading = ref(true);
const error = ref(null);
let pollingInterval = null;

const emit = defineEmits(['back', 'select', 'navigate']);

const fetchCitas = async (isAutoRefresh = false) => {
  try {
    // Si es auto-refresh, no mostramos el spinner de carga completa para no molestar
    if (!isAutoRefresh) loading.value = true;
    
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener citas');
    
    // Asumimos que n8n devuelve un array de objetos o un objeto { data: [...] }
    const data = await response.json();
    citas.value = Array.isArray(data) ? data : (data.data || []);
    error.value = null; // Limpiar errores si tuvo éxito
  } catch (e) {
    console.error(e);
    // Solo mostramos error visual si no es una actualización automática silenciosa
    if (!isAutoRefresh) error.value = "No se pudieron cargar las citas. Verifica tu conexión.";
  } finally {
    loading.value = false;
  }
};

const formatDate = (isoString) => {
  if (!isoString) return 'Sin fecha';
  return new Date(isoString).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

onMounted(() => {
  fetchCitas();
  // Configurar actualización automática cada 60 segundos (60000 ms)
  pollingInterval = setInterval(() => {
    fetchCitas(true);
  }, 60000);
});

onUnmounted(() => {
  // Limpiar el intervalo al salir para evitar fugas de memoria
  if (pollingInterval) clearInterval(pollingInterval);
});
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50 font-sans">
    <!-- Header Reusable -->
    <HeaderList 
      title="Citas" 
      subtitle="Dr. Rubén Quiroz - Cardiología"
      :loading="loading"
      @refresh="fetchCitas(false)"
      @navigate="$emit('navigate', $event)"
    />

    <!-- Content -->
    <main class="flex-1 overflow-auto p-4 md:p-8">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col justify-center items-center h-full text-gray-400">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-3"></div>
        <p class="text-sm font-medium animate-pulse">Cargando agenda...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
        <div class="flex items-center gap-3 text-red-600 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="font-bold text-lg">Error de Conexión</h3>
        </div>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="fetchCitas" class="w-full py-2 bg-red-50 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition-colors">
          Intentar nuevamente
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="citas.length === 0" class="flex flex-col items-center justify-center h-full text-center">
        <div class="bg-teal-50 p-6 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Sin citas programadas</h3>
        <p class="text-gray-500 max-w-xs mt-2">Actualmente no hay citas registradas en el sistema para este periodo.</p>
      </div>

      <!-- Modern Table -->
      <div v-else class="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">
                <th class="px-6 py-4">Información del Paciente</th>
                <th class="px-6 py-4">Fecha y Hora</th>
                <th class="px-6 py-4">Detalles Médicos</th>
                <th class="px-6 py-4 text-center">Estado</th>
                <th class="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr 
                v-for="cita in citas" 
                :key="cita.id" 
                @click="$emit('select', cita)"
                class="group hover:bg-teal-50/30 transition-colors duration-150 cursor-pointer"
              >
                <!-- Paciente Column -->
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {{ cita.paciente_nombre.charAt(0).toUpperCase() }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{{ cita.paciente_nombre }}</div>
                      <div class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <span v-if="cita.telefono">{{ cita.telefono }}</span>
                        <span v-if="cita.email" class="text-gray-400">• {{ cita.email }}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Fecha Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                   <div class="inline-flex flex-col">
                    <span class="text-sm font-semibold text-gray-700">
                      {{ new Date(cita.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' }) }}
                    </span>
                    <span class="text-xs font-mono text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded-md w-fit">
                      {{ new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }) }}
                    </span>
                  </div>
                </td>

                <!-- Motivo Column -->
                <td class="px-6 py-4">
                  <div class="max-w-xs">
                    <div class="text-sm text-gray-800 font-medium truncate" :title="cita.motivo">
                      {{ cita.motivo || 'Sin motivo especificado' }}
                    </div>
                    <div v-if="cita.resumen_medico" class="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {{ cita.resumen_medico }}
                    </div>
                  </div>
                </td>

                <!-- Status Column -->
                <td class="px-6 py-4 text-center whitespace-nowrap">
                  <span v-if="cita.status === 'cancelada' || cita.deleted_at" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 shadow-sm">
                    <span class="h-1.5 w-1.5 rounded-full bg-red-500 mr-2"></span>
                    Cancelada
                  </span>
                  <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2"></span>
                    Confirmada
                  </span>
                </td>

                <!-- Actions Column -->
                <td class="px-6 py-4 text-center">
                  <button 
                    @click.stop="$emit('select', cita)" 
                    class="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Administrar Cita"
                  >
                    <ClipboardCheck :size="20" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Footer / Pagination placeholder -->
        <div class="bg-gray-50 border-t border-gray-100 px-6 py-3 text-xs text-gray-500 flex justify-between items-center">
            <span>Mostrando últimos registros</span>
            <span>Total: {{ citas.length }} citas</span>
        </div>
      </div>
    </main>
  </div>
</template>
