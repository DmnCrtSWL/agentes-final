<script setup>
import { ref } from 'vue';
import { Menu } from 'lucide-vue-next';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  titleColorClass: {
    type: String,
    default: 'text-gray-800'
  }
});

const emit = defineEmits(['navigate', 'refresh']);

const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const handleMenuOption = (option) => {
  showMenu.value = false;
  emit('navigate', option);
};
</script>

<template>
  <header class="bg-white px-6 py-5 flex items-center justify-between border-b border-gray-200 shadow-sm sticky top-0 z-20">
    <div class="flex items-center gap-4 relative">
      <button class="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" @click="toggleMenu">
        <Menu :size="24" />
      </button>

      <!-- Dropdown Menu -->
      <div v-if="showMenu" class="absolute top-12 left-0 bg-white rounded-lg shadow-xl border border-gray-100 z-50 min-w-[180px] py-2 overflow-hidden">
        <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors" @click="handleMenuOption('servicio-cliente')">Servicio a Cliente</div>
        <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors" @click="handleMenuOption('cotizaciones')">Cotizaciones</div>
        <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors" @click="handleMenuOption('citas')">Citas</div>
        <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors" @click="handleMenuOption('cancelaciones')">Cancelaciones</div>
      </div>

      <div>
        <h1 :class="['text-2xl font-bold tracking-tight', titleColorClass]">
          <slot name="icon"></slot>
          {{ title }}
        </h1>
        <div class="flex items-center gap-2 mt-1">
          <p class="text-xs text-gray-500" v-if="subtitle">{{ subtitle }}</p>
          <span v-if="loading" class="text-xs text-teal-600 animate-pulse font-medium">• Actualizando...</span>
        </div>
      </div>
    </div>
    
    <div class="flex items-center gap-3">
      <!-- Botón Actualizar Manual -->
      <button 
        @click="$emit('refresh')" 
        class="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all active:rotate-180 duration-300"
        title="Actualizar lista"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  </header>
</template>
