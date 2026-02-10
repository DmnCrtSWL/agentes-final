<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

interface Appointment {
  id?: number
  nombre: string
  fecha: string
  hora: string
  contacto: string
  motivo: string
  usuario: string
  status?: string
}

const appointments = ref<Appointment[]>([])
const loading = ref(true)
const error = ref('')

const fetchAppointments = async () => {
  try {
    loading.value = true
    const response = await fetch(`${import.meta.env.VITE_API_URL}/cancelaciones`)
    if (!response.ok) throw new Error('Error al cargar citas canceladas')
    
    const data = await response.json()
    
    appointments.value = data.map((cita: any) => {
      let fechaStr = cita.date;
      if (cita.date) {
        const d = new Date(cita.date);
        fechaStr = d.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }

      return {
        id: cita.id,
        nombre: cita.name || 'Sin nombre',
        fecha: fechaStr,
        hora: cita.time || '',
        contacto: cita.phone || cita.email || 'Sin contacto',
        motivo: cita.reason || 'Sin motivo',
        usuario: cita.user || 'Sistema', 
        status: cita.status
      }
    })
  } catch (e) {
    console.error(e)
    error.value = 'No se pudieron cargar las citas canceladas'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAppointments()
})
</script>

<template>
  <DefaultLayout>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-meta-1">Citas Canceladas</h4>

      <div class="flex flex-col">
        <div
          class="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-6"
        >
          <div class="p-2.5 xl:p-5">
            <h5 class="text-sm font-medium uppercase xsm:text-base">Nombre</h5>
          </div>
          <div class="p-2.5 text-center xl:p-5">
            <h5 class="text-sm font-medium uppercase xsm:text-base">Fecha</h5>
          </div>
          <div class="p-2.5 text-center xl:p-5">
            <h5 class="text-sm font-medium uppercase xsm:text-base">Hora</h5>
          </div>
          <div class="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 class="text-sm font-medium uppercase xsm:text-base">Contacto</h5>
          </div>
          <div class="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 class="text-sm font-medium uppercase xsm:text-base">Motivo</h5>
          </div>
          <div class="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 class="text-sm font-medium uppercase xsm:text-base">Usuario</h5>
          </div>
        </div>

        <div
          v-for="(appointment, key) in appointments"
          :key="key"
          :class="`grid grid-cols-3 sm:grid-cols-6 ${
            key === appointments.length - 1
              ? ''
              : 'border-b border-stroke dark:border-strokedark'
          } bg-red-50 dark:bg-red-900/10`"
        >
          <div class="flex items-center p-2.5 xl:p-5">
            <p class="text-meta-1 dark:text-red-400">{{ appointment.nombre }}</p>
          </div>

          <div class="flex items-center justify-center p-2.5 xl:p-5">
            <p class="text-meta-1 dark:text-red-400">{{ appointment.fecha }}</p>
          </div>

          <div class="flex items-center justify-center p-2.5 xl:p-5">
            <p class="text-meta-1 dark:text-red-400">{{ appointment.hora }}</p>
          </div>

          <div class="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
            <p class="text-meta-1 dark:text-red-400">{{ appointment.contacto }}</p>
          </div>

          <div class="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
            <p class="text-meta-1 dark:text-red-400">{{ appointment.motivo }}</p>
          </div>

          <div class="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
            <p class="text-meta-1 dark:text-red-400">{{ appointment.usuario }}</p>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
