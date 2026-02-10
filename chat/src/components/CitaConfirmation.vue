<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  cita: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['back', 'confirm', 'reschedule', 'cancel', 'navigate-chat']);

// Formateadores
const formattedDate = computed(() => {
  if (!props.cita.fecha_hora) return 'Fecha pendiente';
  return new Date(props.cita.fecha_hora).toLocaleDateString('es-MX', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
});

const formattedTime = computed(() => {
  if (!props.cita.fecha_hora) return '--:--';
  return new Date(props.cita.fecha_hora).toLocaleTimeString('es-MX', {
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true
  });
});

const initials = computed(() => {
  return props.cita.paciente_nombre 
    ? props.cita.paciente_nombre.charAt(0).toUpperCase() 
    : '?';
});

// Acciones
const isProcessing = ref(false);

const navigateToChat = () => {
  emit('navigate-chat');
};

const updateStatus = async (newStatus) => {
  isProcessing.value = true;
  const API_URL = import.meta.env.VITE_API_URL || '/api/citas'; // Use relative path logic
  
  try {
    const response = await fetch(`${API_URL}/${props.cita.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) throw new Error('Error al actualizar estado');
    
    // Éxito
    if (newStatus === 'cancelada') {
      alert('La cita ha sido cancelada correctamente.');
      navigateToChat();
    } else {
      // Confirmada
      // alert('¡Cita confirmada!'); // Opcional, el usuario pidió "no pasa nada" visualmente intrusivo
      navigateToChat();
    }
    
  } catch (error) {
    console.error(error);
    alert('Hubo un error al procesar la solicitud.');
  } finally {
    isProcessing.value = false;
  }
};

const handleConfirm = () => {
    updateStatus('confirmada');
};

const handleCancel = () => {
  if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
    updateStatus('cancelada');
  }
};

const handleReschedule = () => {
  // Desactivado por ahora
};
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50 font-sans overflow-auto">
    <!-- Header simple -->
    <div class="px-6 py-4">
      <button 
        @click="$emit('back')" 
        class="flex items-center text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a la lista
      </button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">
        
        <!-- Status Banner -->
        <div class="bg-teal-600 h-2 w-full"></div>

        <!-- Card Body -->
        <div class="p-8">
          
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center h-20 w-20 rounded-full bg-teal-50 text-teal-600 text-3xl font-bold mb-4 shadow-sm border border-teal-100">
              {{ initials }}
            </div>
            <h2 class="text-2xl font-bold text-gray-900">{{ cita.paciente_nombre }}</h2>
            <div class="flex items-center justify-center gap-2 mt-2 text-gray-500 text-sm">
                <span v-if="cita.telefono" class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {{ cita.telefono }}
                </span>
                <span v-if="cita.telefono && cita.email" class="text-gray-300">|</span>
                <span v-if="cita.email" class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ cita.email }}
                </span>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Date & Time -->
            <div class="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="bg-white p-2 rounded-lg shadow-sm text-teal-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase font-bold tracking-wide">Fecha</p>
                        <p class="text-gray-900 font-semibold capitalize">{{ formattedDate }}</p>
                    </div>
                </div>
                <div class="text-right border-l border-gray-200 pl-4">
                    <p class="text-xs text-gray-500 uppercase font-bold tracking-wide">Hora</p>
                    <p class="text-xl font-bold text-teal-700">{{ formattedTime }}</p>
                </div>
            </div>

            <!-- Medical Details -->
            <div v-if="cita.motivo || cita.resumen_medico">
                <h3 class="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Detalles Médicos
                </h3>
                <div class="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-600 space-y-2">
                    <p v-if="cita.motivo"><span class="font-semibold text-gray-800">Motivo:</span> {{ cita.motivo }}</p>
                    <p v-if="cita.resumen_medico" class="text-gray-500 border-t border-gray-100 pt-2 mt-2 italic">
                        "{{ cita.resumen_medico }}"
                    </p>
                </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button 
              @click="handleCancel"
              class="w-full px-4 py-3 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 hover:border-red-300 transition-colors flex justify-center items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
            </button>
            
            <button 
              @click="handleReschedule"
              disabled
              class="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-400 font-medium cursor-not-allowed flex justify-center items-center gap-2 opacity-60"
              title="Próximamente"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reprogramar
            </button>

            <button 
              @click="handleConfirm"
              class="w-full px-4 py-3 rounded-xl bg-teal-600 text-white font-bold shadow-md hover:bg-teal-700 hover:shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Confirmar
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
