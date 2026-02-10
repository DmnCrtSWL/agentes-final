<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ClipboardCheck, Clock } from 'lucide-vue-next';
import HeaderList from './HeaderList.vue';

// URL del API de Backend (Express)
const API_URL = import.meta.env.VITE_API_URL || '/api/cancelaciones'; 

const citas = ref([]);
const loading = ref(true);
const error = ref(null);
const lastUpdated = ref(null);
const now = ref(new Date());
let pollingInterval = null;

const emit = defineEmits(['back', 'select', 'navigate']);

const updateNow = () => {
    now.value = new Date();
};

const getRelativeTime = (date) => {
    if (!date) return '';
    const diffInSeconds = Math.floor((now.value - date) / 1000);

    if (diffInSeconds < 60) return 'Unos segundos';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} horas`;
    return 'Más de un día';
};

const fetchCitas = async (isAutoRefresh = false) => {
  try {
    if (!isAutoRefresh) loading.value = true;
    
    // Cambiamos URL a /cancelaciones
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener cancelaciones');
    
    const data = await response.json();
    citas.value = Array.isArray(data) ? data : (data.data || []);
    error.value = null; 
    lastUpdated.value = new Date(); 
  } catch (e) {
    console.error(e);
    if (!isAutoRefresh) error.value = "No se pudieron cargar las cancelaciones. Verifica tu conexión.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCitas();
  pollingInterval = setInterval(() => {
    fetchCitas(true);
    updateNow();
  }, 60000);
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});
</script>

<template>
  <div class="h-full flex flex-col bg-red-50/30 font-sans">
    <!-- Header Reusable -->
    <HeaderList 
      title="Cancelaciones" 
      subtitle="Historial de cancelaciones"
      :loading="loading"
      title-color-class="text-gray-800"
      @refresh="fetchCitas(false)"
      @navigate="$emit('navigate', $event)"
    />

    <!-- Content -->
    <main class="flex-1 overflow-auto p-4 md:p-8">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col justify-center items-center h-full text-gray-400">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-3"></div>
        <p class="text-sm font-medium animate-pulse">Cargando cancelaciones...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
        <div class="flex items-center gap-3 text-red-600 mb-2">
            Error de conexión
        </div>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="fetchCitas" class="w-full py-2 bg-red-50 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition-colors">
          Intentar nuevamente
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="citas.length === 0" class="flex flex-col items-center justify-center h-full text-center">
        <div class="bg-gray-100 p-6 rounded-full mb-4">
           <ClipboardCheck class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">Sin cancelaciones</h3>
        <p class="text-gray-500 max-w-xs mt-2">No hay registro de citas canceladas recientemente.</p>
      </div>

      <!-- Modern Table -->
      <div v-else class="bg-white rounded-2xl shadow-xl shadow-red-100/50 border border-red-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-red-50/50 border-b border-red-100 text-xs uppercase tracking-wider text-red-400 font-bold">
                <th class="px-6 py-4">Información del Paciente</th>
                <th class="px-6 py-4">Fecha Cancelación</th> <!-- Nueva columna relevante -->
                <th class="px-6 py-4">Fecha Original Cita</th>
                <th class="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-red-50">
              <tr 
                v-for="cita in citas" 
                :key="cita.id" 
                @click="$emit('select', cita)"
                class="group hover:bg-red-50/30 transition-colors duration-150 cursor-pointer"
              >
                <!-- Paciente Column -->
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm shadow-sm grayscale">
                      {{ cita.paciente_nombre.charAt(0).toUpperCase() }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-bold text-gray-900 group-hover:text-red-700 transition-colors">{{ cita.paciente_nombre }}</div>
                      <div class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <span v-if="cita.telefono">{{ cita.telefono }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                
                 <!-- Fecha Cancelación Column -->
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="inline-flex flex-col" v-if="cita.deleted_at">
                        <span class="text-sm font-semibold text-gray-700 capitalize">
                          {{ new Date(cita.deleted_at).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' }) }}
                        </span>
                        <span class="text-xs text-gray-500 font-mono">
                             {{ new Date(cita.deleted_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }) }}
                        </span>
                    </div>
                    <span v-else class="text-gray-400">N/A</span>
                </td>

                <!-- Fecha Original Column -->
                <td class="px-6 py-4 whitespace-nowrap opacity-60">
                   <div class="inline-flex flex-col">
                    <span class="text-sm font-semibold text-gray-700 capitalize">
                      {{ new Date(cita.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}
                    </span>
                    <span class="text-xs text-gray-500 font-mono">
                         {{ new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }) }}
                    </span>
                  </div>
                </td>    

                <!-- Status Column -->
                <td class="px-6 py-4 text-center whitespace-nowrap">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200 shadow-sm">
                    Cancelada
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="bg-gray-50 border-t border-gray-100 px-6 py-3 text-xs text-gray-500 flex justify-between items-center">
            <span>
                <span v-if="lastUpdated" class="flex items-center gap-1.5">
                    <Clock :size="14" />
                    Actualizado hace: {{ getRelativeTime(lastUpdated) }}
                </span>
            </span>
            <span>Total: {{ citas.length }} canceladas</span>
        </div>
      </div>
    </main>
  </div>
</template>
