<template>
  <v-sheet
    :elevation="dragover ? 4 : 0"
    rounded="xl"
    class="d-flex align-center justify-center pa-4 border-dashed"
    @dragover.prevent="dragover = true"
    @dragleave="dragover = false"
    @drop.prevent="onDrop"
    tabindex="0"
    role="button"
    @click="pickFile"
    @keydown.enter.prevent="pickFile"
  >
    <span v-if="filename">{{ filename }}<span v-if="rows"> ({{ rows }} rows)</span></span>
    <span v-else>Drop CSV or click</span>
    <input ref="input" type="file" accept=".csv" class="d-none" @change="onFile" />
  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const { rows } = defineProps<{ rows: number }>();
const emit = defineEmits<{ (e: 'file', file: File): void }>();

const dragover = ref(false);
const filename = ref('');
const input = ref<HTMLInputElement>();

function pickFile() {
  input.value?.click();
}
function onDrop(e: DragEvent) {
  dragover.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    filename.value = file.name;
    emit('file', file);
  }
}
function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    filename.value = file.name;
    emit('file', file);
  }
}
</script>

<style scoped>
.border-dashed {
  border: 2px dashed currentColor;
  cursor: pointer;
}
</style>
