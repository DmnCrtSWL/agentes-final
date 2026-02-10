<script setup>
import { Menu } from "lucide-vue-next";
import { ref } from "vue";

const emit = defineEmits(["selectAgent"]);
const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const selectAgent = (agentId) => {
  emit("selectAgent", agentId);
  showMenu.value = false;
};

const handleCotizaciones = () => {
  alert("Sección en desarrollo");
  showMenu.value = false;
};

defineProps({
  contactName: {
    type: String,
    default: "Agente Uno",
  },
  status: {
    type: String,
    default: "Online",
  },
  avatarUrl: {
    type: String,
    default: "https://i.pravatar.cc/150?u=agente-uno",
  },
});
</script>

<template>
  <header class="chat-header">
    <div class="left-section">
      <button class="icon-btn back-btn" @click="toggleMenu">
        <Menu :size="24" />
      </button>

      <!-- Dropdown Menu -->
      <div v-if="showMenu" class="agent-menu">
        <div class="menu-item" @click="handleCotizaciones">Cotizaciones</div>
      </div>

      <div class="avatar-container">
        <img :src="avatarUrl" alt="Avatar" class="avatar" />
      </div>
      <div class="contact-info">
        <h1 class="contact-name">{{ contactName }}</h1>
        <span class="status">{{ status }}</span>
      </div>
    </div>

    <div class="right-section">
      <!-- Icons removed -->
    </div>
  </header>
</template>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: var(--wa-teal);
  color: var(--wa-header-text);
  height: 60px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.avatar-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #ccc;
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.contact-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.contact-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.status {
  font-size: 13px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  background: none;
  border: none;
  color: white;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.back-btn {
  margin-right: -4px;
}

.agent-menu {
  position: absolute;
  top: 60px;
  left: 10px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 100;
  min-width: 150px;
  overflow: hidden;
  padding: 8px 0;
}

.menu-item {
  padding: 10px 16px;
  color: #333;
  cursor: pointer;
  font-size: 14px;
}

.menu-item:hover {
  background-color: #f0f0f0;
}
</style>
