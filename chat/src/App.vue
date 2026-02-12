<script setup>
import { ref, computed, onMounted } from "vue";
import ChatHeader from "./components/ChatHeader.vue";
import MessageList from "./components/MessageList.vue";
import ChatInput from "./components/ChatInput.vue";
import CitasList from "./components/CitasList.vue";
import CancelacionesList from "./components/CancelacionesList.vue";
import CitaConfirmation from "./components/CitaConfirmation.vue";

const activeAgentId = ref(1);
const showCitas = ref(false);
const showCancelaciones = ref(false);
const selectedCita = ref(null);

const agents = ref({
  // ... content remains same, handled by diff context if possible, but simplest is to keep imports and setup
  // Actually simpler to just replace the top block.
  1: {
    id: 1,
    name: "Ana",
    avatar: "/agent-service.png",
    messages: [],
  },
  2: {
    id: 2,
    name: "Agente 2",
    avatar: "/agent-agenda.png",
    messages: [],
  },
  3: {
    id: 3,
    name: "Agente 3",
    avatar: "/agent-reservations.png",
    messages: [],
  },
  4: {
    id: 4,
    name: "Jessica",
    avatar: "/agent-jessica.jpg",
    messages: [],
  },
});

const activeAgent = computed(() => agents.value[activeAgentId.value]);

// -------------------------------------------------------------
// CONFIGURACIÓN DE N8N
const N8N_PROD_URL = "https://dmncrt.app.n8n.cloud/webhook/chat/asistente";
const N8N_TEST_URL = "https://dmncrt.app.n8n.cloud/webhook/chat/asistente";

// Webhook por defecto (Ana / Servicio a Cliente)
const N8N_WEBHOOK_SERVICE_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL ||
  (import.meta.env.DEV ? N8N_TEST_URL : N8N_PROD_URL);

// Webhook para Cotizaciones (Jessica) - Producción con CORS configurado
const N8N_WEBHOOK_QUOTES_URL =
  import.meta.env.VITE_N8N_WEBHOOK_QUOTES_URL ||
  "https://dmncrt.app.n8n.cloud/webhook/chat/cotizaciones";

console.log("🔗 N8N Service URL:", N8N_WEBHOOK_SERVICE_URL);
console.log("🔗 N8N Quotes URL:", N8N_WEBHOOK_QUOTES_URL);

// Generar una sesión única (Persistente en LocalStorage)
const getSessionId = () => {
  let stored = localStorage.getItem("chat_session_id");
  if (!stored) {
    stored =
      "session-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("chat_session_id", stored);
  }
  return stored;
};

const sessionId = ref(getSessionId());

// Lógica de inicio: Revisar si venimos de un correo de confirmación
onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const confirmId = urlParams.get("confirmar_id");

  if (confirmId) {
    console.log("🔗 Link de confirmación detectado para Cita ID:", confirmId);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "/api/citas";
      const res = await fetch(API_URL);
      const data = await res.json();
      const citas = Array.isArray(data) ? data : data.data || [];

      // Buscar la cita específica
      const citaEncontrada = citas.find((c) => c.id == confirmId);

      if (citaEncontrada) {
        selectedCita.value = citaEncontrada;
        // Limpiamos la URL para que no quede "sucia"
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      } else {
        console.warn("Cita no encontrada en la lista activa");
      }
    } catch (e) {
      console.error("Error cargando cita por ID:", e);
    }
  }
});

const handleSelectAgent = async (id) => {
  if (id === "citas") {
    showCitas.value = true;
    showCancelaciones.value = false;
    selectedCita.value = null;
  } else if (id === "cancelaciones") {
    showCitas.value = false;
    showCancelaciones.value = true;
    selectedCita.value = null;
  } else if (id === "cotizaciones") {
    activeAgentId.value = 4; // Jessica
    showCitas.value = false;
    showCancelaciones.value = false;
    selectedCita.value = null;
  } else if (id === "confirmaciones") {
    // ... existing logic
    try {
      const API_URL = import.meta.env.VITE_API_URL || "/api/citas";
      const res = await fetch(API_URL);
      const data = await res.json();
      const citas = Array.isArray(data) ? data : data.data || [];

      if (citas.length > 0) {
        // Seleccionamos la primera cita para mostrar en la card
        selectedCita.value = citas[0];
      } else {
        alert("No hay citas disponibles para confirmar.");
        showCitas.value = true;
      }
    } catch (e) {
      console.error(e);
      showCitas.value = true;
    }
  } else if (id === "servicio-cliente") {
    activeAgentId.value = 1; // Ana
    showCitas.value = false;
    showCancelaciones.value = false;
    selectedCita.value = null;
  } else {
    activeAgentId.value = id;
    showCitas.value = false;
    showCancelaciones.value = false;
    selectedCita.value = null;
  }
};

const sendMessageToN8N = async (text, agentId, files = []) => {
  try {
    // Convert files to base64
    const filePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result, // base64 data URL
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    const filesData = await Promise.all(filePromises);

    // Determinar URL del webhook según el agente
    let targetWebhookUrl = N8N_WEBHOOK_SERVICE_URL;
    if (agentId === 4) {
      // Jessica (Cotizaciones)
      targetWebhookUrl = N8N_WEBHOOK_QUOTES_URL;
    }

    const payload = {
      message: text,
      agentId: agentId,
      sessionId: sessionId.value,
      files: filesData,
    };

    console.log(`📤 Enviando mensaje a n8n (Agente ${agentId}):`, {
      url: targetWebhookUrl,
      payload: {
        ...payload,
        files: filesData.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
        })),
      },
    });

    const response = await fetch(targetWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("📥 Respuesta de n8n:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error en respuesta n8n:", errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Datos recibidos de n8n:", data);

    return (
      data.reply ||
      data.output ||
      "Lo siento, hubo un error procesando tu mensaje."
    );
  } catch (error) {
    console.error("❌ Error conectando con n8n:", error);
    return `Error de conexión: ${error.message}`;
  }
};

const handleSendMessage = async (text, files = []) => {
  const currentAgentId = activeAgentId.value;

  // Create message text with file info if files are attached
  let displayText = text;
  if (files.length > 0 && !text.trim()) {
    displayText = `📎 ${files.length} archivo${files.length > 1 ? "s" : ""} adjunto${files.length > 1 ? "s" : ""}`;
  } else if (files.length > 0) {
    displayText = `${text}\n📎 ${files.length} archivo${files.length > 1 ? "s" : ""}`;
  }

  const newMsg = {
    id: Date.now(),
    text: displayText,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isMine: true,
    status: "sent",
    files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
  };

  // Add to current agent's messages
  activeAgent.value.messages.push(newMsg);

  // Simular estado "delivered" rápido
  setTimeout(() => {
    newMsg.status = "delivered";
  }, 500);

  // Llamada a API real con archivos
  const replyText = await sendMessageToN8N(text, currentAgentId, files);

  // Agregar respuesta
  activeAgent.value.messages.push({
    id: Date.now() + 1,
    text: replyText,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isMine: false,
    status: "read",
  });

  newMsg.status = "read";
};
</script>

<template>
  <div class="app-container">
    <!-- VISTA DETALLE CITA -->
    <CitaConfirmation
      v-if="selectedCita"
      :cita="selectedCita"
      @back="selectedCita = null"
      @navigate-chat="
        selectedCita = null;
        showCitas = false;
        showCancelaciones = false;
      "
      @confirm="console.log('Confirmada:', $event)"
      @reschedule="console.log('Reprogramar:', $event)"
      @cancel="console.log('Cancelar:', $event)"
    />

    <!-- VISTA LISTA CITAS -->
    <CitasList
      v-else-if="showCitas"
      @select="selectedCita = $event"
      @back="showCitas = false"
      @navigate="handleSelectAgent"
    />

    <!-- VISTA LISTA CANCELACIONES -->
    <CancelacionesList
      v-else-if="showCancelaciones"
      @select="selectedCita = $event"
      @back="showCancelaciones = false"
      @navigate="handleSelectAgent"
    />

    <!-- VISTA DE CHAT -->
    <template v-else>
      <ChatHeader
        :contact-name="activeAgent.name"
        :status="'En línea'"
        :avatar-url="activeAgent.avatar"
        :active-agent-id="activeAgentId"
        @selectAgent="handleSelectAgent"
      />

      <MessageList :messages="activeAgent.messages" />

      <ChatInput @sendMessage="handleSendMessage" />
    </template>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
