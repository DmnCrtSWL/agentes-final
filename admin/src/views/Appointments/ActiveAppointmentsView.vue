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
    const response = await fetch('http://localhost:3000/api/citas')
    if (!response.ok) throw new Error('Error al cargar citas')
    
    const data = await response.json()
    
    appointments.value = data.map((cita: any) => {
      // Formatear fecha
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
    error.value = 'No se pudieron cargar las citas'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAppointments()
})

const handleView = (appointment: Appointment) => {
  console.log('View appointment:', appointment)
}

const handleCancel = async (appointment: Appointment) => {
  if (!confirm(`¿Estás seguro de cancelar la cita de ${appointment.nombre}?`)) return

  try {
    const response = await fetch(`http://localhost:3000/api/citas/${appointment.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'cancelada' })
    })

    if (response.ok) {
      // Remove from list or refresh
      await fetchAppointments()
    } else {
      alert('Error al cancelar la cita')
    }
  } catch (e) {
    console.error(e)
    alert('Error de conexión al cancelar')
  }
}
</script>

<template>
  <DefaultLayout>
    <div
      class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
    >
      <h4 class="mb-6 text-xl font-semibold text-black dark:text-white">Citas Activas</h4>

      <div class="flex flex-col">
        <div
          class="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-7"
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
          <div class="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 class="text-sm font-medium uppercase xsm:text-base">Acciones</h5>
          </div>
        </div>

        <div
          v-for="(appointment, key) in appointments"
          :key="key"
          :class="`grid grid-cols-3 sm:grid-cols-7 ${
            key === appointments.length - 1
              ? ''
              : 'border-b border-stroke dark:border-strokedark'
          }`"
        >
          <div class="flex items-center p-2.5 xl:p-5">
            <p class="text-black dark:text-white">{{ appointment.nombre }}</p>
          </div>

          <div class="flex items-center justify-center p-2.5 xl:p-5">
            <p class="text-black dark:text-white">{{ appointment.fecha }}</p>
          </div>

          <div class="flex items-center justify-center p-2.5 xl:p-5">
            <p class="text-black dark:text-white">{{ appointment.hora }}</p>
          </div>

          <div class="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
            <p class="text-black dark:text-white">{{ appointment.contacto }}</p>
          </div>

          <div class="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
            <p class="text-black dark:text-white">{{ appointment.motivo }}</p>
          </div>

          <div class="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
            <p class="text-black dark:text-white">{{ appointment.usuario }}</p>
          </div>

          <div class="hidden items-center justify-center gap-2 p-2.5 sm:flex xl:p-5">
            <button
              @click="handleView(appointment)"
              class="inline-flex items-center justify-center rounded-md bg-primary p-2 text-white hover:bg-opacity-90"
              title="Ver detalles"
            >
              <svg
                class="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.0002 1.5C5.0627 1.5 1.71895 4.0125 0.506201 7.5C1.71895 10.9875 5.0627 13.5 9.0002 13.5C12.9377 13.5 16.2815 10.9875 17.494 7.5C16.2815 4.0125 12.9377 1.5 9.0002 1.5ZM9.0002 11.5C6.9252 11.5 5.2502 9.825 5.2502 7.75C5.2502 5.675 6.9252 4 9.0002 4C11.0752 4 12.7502 5.675 12.7502 7.75C12.7502 9.825 11.0752 11.5 9.0002 11.5ZM9.0002 5.5C7.7502 5.5 6.7502 6.5 6.7502 7.75C6.7502 9 7.7502 10 9.0002 10C10.2502 10 11.2502 9 11.2502 7.75C11.2502 6.5 10.2502 5.5 9.0002 5.5Z"
                  fill=""
                />
              </svg>
            </button>
            <button
              @click="handleCancel(appointment)"
              class="inline-flex items-center justify-center rounded-md bg-meta-1 p-2 text-white hover:bg-opacity-90"
              title="Cancelar cita"
            >
              <svg
                class="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                  fill=""
                />
                <path
                  d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                  fill=""
                />
                <path
                  d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                  fill=""
                />
                <path
                  d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                  fill=""
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
