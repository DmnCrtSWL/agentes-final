<script setup>
import { ref, computed } from 'vue';
import { Plus, Mic, Send, Smile, Camera, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-vue-next';

const emit = defineEmits(['sendMessage', 'sendAttachment']);

const messageText = ref('');
const fileInput = ref(null);
const attachedFiles = ref([]);
const isDragging = ref(false);

const handleSend = () => {
  if (messageText.value.trim() || attachedFiles.value.length > 0) {
    emit('sendMessage', messageText.value, attachedFiles.value);
    messageText.value = '';
    attachedFiles.value = [];
  }
};

const handleKeyup = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    handleSend();
  }
};

const handleAttachClick = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || []);
  addFiles(files);
  // Reset input to allow selecting the same file again
  if (fileInput.value) fileInput.value.value = '';
};

const addFiles = (files) => {
  const validFiles = files.filter(file => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      alert(`Tipo de archivo no permitido: ${file.name}. Solo se permiten JPG, PNG y PDF.`);
      return false;
    }
    
    if (file.size > maxSize) {
      alert(`Archivo muy grande: ${file.name}. Tamaño máximo: 10MB.`);
      return false;
    }
    
    return true;
  });
  
  attachedFiles.value = [...attachedFiles.value, ...validFiles];
};

const removeFile = (index) => {
  attachedFiles.value.splice(index, 1);
};

const handleDragOver = (e) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (e) => {
  e.preventDefault();
  isDragging.value = false;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;
  
  const files = Array.from(e.dataTransfer.files || []);
  addFiles(files);
};

const getFileIcon = (file) => {
  if (file.type.startsWith('image/')) {
    return ImageIcon;
  }
  return FileText;
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
</script>

<template>
  <footer 
    class="chat-footer"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    :class="{ 'dragging': isDragging }"
  >
    <!-- Drag & Drop Overlay -->
    <div v-if="isDragging" class="drag-overlay">
      <div class="drag-content">
        <Paperclip :size="48" />
        <p>Suelta los archivos aquí</p>
      </div>
    </div>

    <!-- Attached Files Preview -->
    <div v-if="attachedFiles.length > 0" class="attached-files">
      <div v-for="(file, index) in attachedFiles" :key="index" class="file-preview">
        <component :is="getFileIcon(file)" :size="20" class="file-icon" />
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
        </div>
        <button @click="removeFile(index)" class="remove-file-btn">
          <X :size="16" />
        </button>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <button class="icon-btn" @click="handleAttachClick" title="Adjuntar archivo">
        <Paperclip :size="24" />
      </button>
      
      <input 
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/jpg,image/png,application/pdf"
        multiple
        style="display: none"
        @change="handleFileSelect"
      />
      
      <div class="input-container">
        <div class="input-wrapper">
          <input 
            v-model="messageText" 
            type="text" 
            placeholder="Mensaje" 
            class="chat-input"
            @keyup.enter="handleSend"
          />
          <button class="icon-btn-input">
            <Smile :size="20" class="emoji-icon" />
          </button>
        </div>
      </div>

      <button class="voice-btn" @click="handleSend">
        <Send v-if="messageText.trim() || attachedFiles.length > 0" :size="20" class="send-icon" />
        <Mic v-else :size="20" />
      </button>
    </div>
  </footer>
</template>

<style scoped>
.chat-footer {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #F0F2F5;
  z-index: 10;
  transition: background-color 0.2s;
}

.chat-footer.dragging {
  background-color: #E3F2FD;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(37, 211, 102, 0.1);
  border: 2px dashed var(--wa-teal);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
}

.drag-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--wa-teal);
}

.drag-content p {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.attached-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 12px 8px 12px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E9EDEF;
  max-height: 200px;
  overflow-y: auto;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background-color: #F0F2F5;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.file-preview:hover {
  background-color: #E9EDEF;
}

.file-icon {
  color: var(--wa-teal);
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #111B21;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #667781;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #667781;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.remove-file-btn:hover {
  background-color: #D1D7DB;
  color: #111B21;
}

.input-area {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  color: #54656F;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background-color: #D1D7DB;
}

.input-container {
  flex: 1;
  display: flex;
  align-items: center;
}

.input-wrapper {
  background-color: white;
  border-radius: 20px;
  width: 100%;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.chat-input {
  border: none;
  background: transparent;
  width: 100%;
  font-size: 16px;
  padding: 5px;
  outline: none;
  color: #111B21;
}

.chat-input::placeholder {
  color: #667781;
}

.icon-btn-input {
  background: none;
  border: none;
  color: #54656F;
  padding: 0 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.icon-btn-input:hover {
  background-color: #F0F2F5;
}

.emoji-icon {
  color: #54656F;
}

.voice-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background-color: var(--wa-teal);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s, background-color 0.2s;
}

.voice-btn:hover {
  background-color: #06CF9C;
}

.voice-btn:active {
  transform: scale(0.95);
}

.send-icon {
  margin-left: 2px;
}
</style>
