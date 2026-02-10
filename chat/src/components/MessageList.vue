<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import MessageBubble from './MessageBubble.vue';

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
});

const scrollContainer = ref(null);

const scrollToBottom = async () => {
  await nextTick();
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};

onMounted(() => {
  scrollToBottom();
});

watch(() => props.messages.length, () => {
  scrollToBottom();
});
const isLastInGroup = (index) => {
  if (index === props.messages.length - 1) return true;
  return props.messages[index].isMine !== props.messages[index + 1].isMine;
};

</script>

<template>
  <div class="message-list" ref="scrollContainer">
    <div class="messages-wrapper">
      <MessageBubble 
        v-for="(msg, index) in messages" 
        :key="msg.id"
        :text="msg.text"
        :time="msg.time"
        :is-mine="msg.isMine"
        :status="msg.status"
        :show-tail="isLastInGroup(index)"
      />
    </div>
  </div>
</template>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  position: relative;
  background-color: var(--wa-bg);
  display: flex;
  flex-direction: column;
}

.messages-wrapper {
  position: relative;
  z-index: 1;
  padding: 8px 0;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
}
</style>
