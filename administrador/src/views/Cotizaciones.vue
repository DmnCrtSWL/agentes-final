<template>
  <admin-layout>
    <div class="p-6">
    <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Cotizaciones</h1>
    
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
                Cliente
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Teléfono
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Servicio
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Monto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="quote in quotes" :key="quote.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ quote.customer_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ quote.customer_email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ quote.customer_phone }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {{ quote.service_description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(quote.total_amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(quote.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                  {{ quote.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(quote.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="viewQuote(quote)"
                  class="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  Ver
                </button>
              </td>
            </tr>
            <tr v-if="quotes.length === 0">
              <td colspan="8" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No hay cotizaciones
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quote Detail Modal -->
    <div v-if="selectedQuote" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4" @click.stop>
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Detalle de Cotización</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Cliente</h3>
            <p class="text-gray-900 dark:text-white">{{ selectedQuote.customer_name }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
            <p class="text-gray-900 dark:text-white">{{ selectedQuote.customer_email }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</h3>
            <p class="text-gray-900 dark:text-white">{{ selectedQuote.customer_phone }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Servicio</h3>
            <p class="text-gray-900 dark:text-white">{{ selectedQuote.service_description }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Monto Total</h3>
            <p class="text-gray-900 dark:text-white text-lg font-semibold">{{ formatCurrency(selectedQuote.total_amount) }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</h3>
            <span :class="getStatusClass(selectedQuote.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
              {{ selectedQuote.status }}
            </span>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Creación</h3>
            <p class="text-gray-900 dark:text-white">{{ formatDate(selectedQuote.created_at) }}</p>
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

defineOptions({
  name: 'CotizacionesView'
});

const quotes = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedQuote = ref(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchQuotes = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch(`${API_URL}/api/quotes`);
    
    if (!response.ok) {
      throw new Error('Error al cargar las cotizaciones');
    }
    
    const data = await response.json();
    quotes.value = data;
  } catch (err) {
    console.error('Error fetching quotes:', err);
    error.value = 'Error al cargar las cotizaciones. Por favor, intenta de nuevo.';
  } finally {
    loading.value = false;
  }
};

const viewQuote = (quote) => {
  selectedQuote.value = quote;
};

const closeModal = () => {
  selectedQuote.value = null;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatCurrency = (amount) => {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

const getStatusClass = (status) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'approved' || statusLower === 'aprobada') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  }
  if (statusLower === 'pending' || statusLower === 'pendiente') {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
  }
  if (statusLower === 'rejected' || statusLower === 'rechazada') {
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

onMounted(() => {
  fetchQuotes();
});
</script>
