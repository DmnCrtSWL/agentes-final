<script setup lang="ts">
import { ref, watch } from 'vue'

interface Appointment {
  id?: number
  nombre?: string
  fecha: string // Assuming required based on usage
  hora?: string
  contacto?: string
  metodo?: string
  motivo?: string
  usuario?: string
  status?: string
}

const props = defineProps<{
  isOpen: boolean
  appointment: Appointment | null
}>()

const emit = defineEmits(['close', 'refresh'])

const isEditing = ref(false)
const editForm = ref({
  date: '',
  time: ''
})

// Initialize edit form when appointment changes or modal opens
watch(
  () => props.appointment,
  (newVal) => {
    if (newVal) {
      // Convert 'DD/MM/YYYY' to 'YYYY-MM-DD' for input[type="date"]
      // Assuming appointment.fecha is 'DD/MM/YYYY' based on ActiveAppointmentsView
      const parts = newVal.fecha.split('/')
      let isoDate = ''
      if (parts.length === 3) {
        isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`
      } else {
        // Fallback or if already ISO
        isoDate = newVal.fecha
      }

      editForm.value = {
        date: isoDate,
        time: newVal.hora || ''
      }
    }
    isEditing.value = false
  },
  { immediate: true }
)

const handleClose = () => {
  isEditing.value = false
  emit('close')
}

const handleOutsideClick = () => {
  // content wrapper handles click stop propagation, so this triggers only on backdrop
  handleClose()
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

const handleSave = async () => {
  if (!props.appointment?.id) return

  try {
    const response = await fetch(`http://localhost:3000/api/citas/${props.appointment.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: editForm.value.date,
        time: editForm.value.time
      })
    })

    if (response.ok) {
      emit('refresh')
      handleClose()
    } else {
      alert('Error al actualizar la cita')
    }
  } catch (e) {
    console.error(e)
    alert('Error de conexión')
  }
}

const handleCancelAppointment = async () => {
  if (!props.appointment?.id) return
  if (!confirm('Esta por Cancelar una cita, este proceso no es reversible. OK y Cancelar.')) return

  try {
    const response = await fetch(`http://localhost:3000/api/citas/${props.appointment.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'cancelada' })
    })

    if (response.ok) {
      emit('refresh')
      handleClose()
    } else {
      alert('Error al cancelar la cita')
    }
  } catch (e) {
    console.error(e)
    alert('Error de conexión')
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed left-0 top-0 z-999999 flex h-full w-full items-center justify-center bg-black/90 px-4 py-5"
    @click="handleOutsideClick"
  >
    <div
      class="w-full max-w-142.5 rounded-lg bg-white py-4 px-8 text-center dark:bg-boxdark md:py-8 md:px-17.5 relative"
      @click.stop
    >
      <!-- Close Button -->
      <button
        class="absolute top-4 right-4 text-black dark:text-white hover:text-primary"
        @click="handleClose"
      >
        <svg
          class="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.3333 2.54666L17.4533 0.666656L10 8.11999L2.54667 0.666656L0.666672 2.54666L8.12 9.99999L0.666672 17.4533L2.54667 19.3333L10 11.88L17.4533 19.3333L19.3333 17.4533L11.88 9.99999L19.3333 2.54666Z"
            fill=""
          />
        </svg>
      </button>

      <h3 class="pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">Detalle de Cita</h3>
      <span class="mx-auto mb-6 inline-block h-1 w-22.5 rounded bg-primary"></span>

      <div v-if="appointment" class="text-left">
        <div class="mb-4">
          <label class="mb-2 block font-medium text-black dark:text-white">Paciente</label>
          <div
            class="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          >
            {{ appointment.nombre }}
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div class="mb-4">
            <label class="mb-2 block font-medium text-black dark:text-white">Fecha</label>
            <div
              v-if="!isEditing"
              class="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              {{ appointment.fecha }}
            </div>
            <input
              v-else
              type="date"
              v-model="editForm.date"
              class="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
            />
          </div>

          <div class="mb-4">
            <label class="mb-2 block font-medium text-black dark:text-white">Hora</label>
            <div
              v-if="!isEditing"
              class="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              {{ appointment.hora }}
            </div>
            <input
              v-else
              type="time"
              v-model="editForm.time"
              class="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="mb-2 block font-medium text-black dark:text-white">Contacto</label>
          <div
            class="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            {{ appointment.contacto }}
          </div>
        </div>

        <div class="mb-4">
          <label class="mb-2 block font-medium text-black dark:text-white">Motivo</label>
          <div
            class="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            {{ appointment.motivo }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 flex flex-wrap justify-between gap-4">
        <!-- Left Side: Actions -->
        <div class="flex gap-4">
          <!-- Edit Button -->
          <button
            @click="toggleEdit"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-[#F9C107] text-[#F9C107] hover:bg-[#F9C107] hover:text-white transition"
            title="Editar"
          >
            <!-- Pencil Icon -->
            <svg
              class="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.8333 2.5C16.275 2.5 16.7167 2.66667 17.0583 3.00833C17.7417 3.69167 17.7417 4.8 17.0583 5.48333L16.2333 6.30833L13.6917 3.76667L14.5167 2.94167C14.8583 2.6 15.3 2.5 15.8333 2.5ZM2.5 14.1667V17.5H5.83333L12.95 10.3833L9.61667 7.05L2.5 14.1667Z"
                fill=""
              />
            </svg>
          </button>

          <!-- Cancel Button -->
          <button
            @click="handleCancelAppointment"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white transition"
            title="Cancelar Cita"
          >
            <!-- Trash Icon (using basic SVG for now) -->
            <svg
              class="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.5 4.16667H13.3333L12.0833 2.5H7.91667L6.66667 4.16667H2.5V5.83333H17.5V4.16667ZM3.33333 16.6667C3.33333 17.5833 4.08333 18.3333 5 18.3333H15C15.9167 18.3333 16.6667 17.5833 16.6667 16.6667V6.66667H3.33333V16.6667Z"
                fill=""
              />
            </svg>
          </button>
        </div>

        <!-- Right Side: Accept/Continue -->
        <button
          @click="isEditing ? handleSave() : handleClose()"
          class="flex items-center justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
        >
          {{ isEditing ? 'Continuar' : 'Aceptar' }}
        </button>
      </div>
    </div>
  </div>
</template>
