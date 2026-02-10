<script setup>


defineProps({
  text: String,
  time: String,
  isMine: Boolean,
  status: {
    type: String,
    default: 'read', // sent, delivered, read
    validator: (value) => ['sent', 'delivered', 'read'].includes(value)
  },
  showTail: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <div class="message-container" :class="{ 'my-message': isMine }">
    <div class="message-bubble" :class="{ 'no-tail': !showTail || isMine }">
      <div class="message-content">
        <p class="message-text">{{ text }}</p>
        <div class="message-meta">
          <span class="message-time">{{ time }}</span>
        </div>
      </div>
      <!-- SVG Tail -->
      <span v-if="showTail && !isMine" class="tail-container">
        <svg viewBox="0 0 8 13" height="13" width="8" preserveAspectRatio="xMidYMid slice" fit="" version="1.1">
          <path v-if="!isMine" opacity="0.13" fill="#00000000" d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"></path>
          <path v-if="!isMine" fill="#FFFFFF" d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"></path>
          
          <path v-if="isMine" opacity="0.13" fill="#00000000" d="M6.467,3.568L0,12.193V1h5.188 C6.958,1,7.526,2.156,6.467,3.568z"></path>
          <path v-if="isMine" fill="#D9FDD3" d="M6.467,3.568L0,12.193V1h5.188 C6.958,1,7.526,2.156,6.467,3.568z"></path>
        </svg>
      </span>
    </div>
  </div>
</template>

<style scoped>
.message-container {
  display: flex;
  margin-bottom: 2px;
  padding: 0 12px; /* Increased side padding */
  width: 100%;
}

.message-container:not(.my-message) {
  justify-content: flex-start;
}

.my-message {
  justify-content: flex-end;
}

.message-bubble {
  position: relative;
  max-width: 85%; /* standard width limit */
  min-width: 80px; /* ensure small messages don't look weirdly tiny */
  border-radius: 7.5px;
  box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
  margin-top: 6px; /* Space between bubbles */
}

/* Rounded corners when no tail - override the specific flat corners */
.message-container:not(.my-message) .message-bubble.no-tail {
  border-top-left-radius: 7.5px;
}

.my-message .message-bubble.no-tail {
  border-top-right-radius: 7.5px;
}

.message-container:not(.my-message) .message-bubble {
  background-color: var(--wa-incoming-bg);
  border-top-left-radius: 0;
}

.my-message .message-bubble {
  background-color: var(--wa-outgoing-bg);
  border-top-right-radius: 0;
}

.message-content {
  padding: 6px 7px 8px 9px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end; /* Align time to bottom */
}

.message-text {
  margin: 0;
  font-size: 14.2px;
  line-height: 19px;
  color: var(--wa-message-text);
  margin-right: 8px; /* Space for time if on same line */
  white-space: pre-wrap; /* Handle newlines */
  word-wrap: break-word;
}

.message-meta {
  margin-left: auto; /* Push to right */
  display: flex;
  align-items: center;
  gap: 3px;
  height: 15px; /* compact height */
  margin-bottom: -3px; /* visual adjustment */
}

.message-time {
  font-size: 11px;
  color: var(--wa-subtle-text);
}



/* Tail logic - basic absolute positioning simulation */
.tail-container {
  position: absolute;
  top: 0;
  width: 8px;
  height: 13px;
  z-index: 1; /* Below content but needed to cover gaps */
}

.message-container:not(.my-message) .tail-container {
  left: -8px;
}

.my-message .tail-container {
  right: -8px;
  transform: scaleX(-1); /* Flip for right side */
}


</style>
