<template>
  <v-card flat class="pa-2" v-if="profile">
    <v-card class="mb-4" elevation="2" rounded="xl">
      <v-card-title>Import</v-card-title>
      <v-card-text>
        <file-drop-zone @file="onFile" :rows="rowsCount" class="mb-2" />
        <v-file-input accept=".csv" density="compact" hide-details @change="onInput" />
      </v-card-text>
    </v-card>

    <v-card class="mb-4" elevation="2" rounded="xl">
      <v-card-title>Profile</v-card-title>
      <v-card-text>
        <v-select
          :items="profiles"
          item-title="id"
          item-value="id"
          v-model="profileId"
          density="compact"
          hide-details
        />
      </v-card-text>
    </v-card>

    <v-card class="mb-4" elevation="2" rounded="xl">
      <v-card-title>Pricing quantity</v-card-title>
      <v-card-text>
        <v-select :items="[1,10,100,1000]" v-model="priceQty" density="compact" hide-details />
      </v-card-text>
    </v-card>

    <v-card elevation="2" rounded="xl">
      <v-card-title>Weights &amp; params</v-card-title>
      <v-card-text>
        <div v-for="c in profile.criteria" :key="c.name" class="mb-4">
          <div class="d-flex align-center">
            <span class="mr-2" style="width:120px">{{ c.name }}</span>
            <v-slider
              v-model.number="weights[c.name]"
              min="0"
              max="3"
              step="0.1"
              class="flex-grow-1"
              color="primary"
              thumb-label="always"
              show-ticks
              density="compact"
              hide-details
            >
              <template #append>
                <v-text-field v-model.number="weights[c.name]" type="number" style="width:60px" density="compact" hide-details />
              </template>
            </v-slider>
          </div>
          <div v-if="c.params" class="d-flex mt-2">
            <v-text-field
              v-for="(_, k) in c.params"
              :key="k"
              v-model.number="params[c.name][k]"
              :label="k"
              type="number"
              density="compact"
              class="mr-2"
              hide-details
            />
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useProfileStore } from '../store/profile';
import { useUiStore } from '../store/ui';
import FileDropZone from './common/FileDropZone.vue';

const emit = defineEmits<{ (e: 'file', file: File): void }>();

const profileStore = useProfileStore();
const ui = useUiStore();

const profile = computed(() => profileStore.active);
const profiles = computed(() => profileStore.allProfiles);

const weights = profileStore.weights;
const params = profileStore.params as any;
const priceQty = computed({
  get: () => profileStore.priceQty,
  set: (v) => (profileStore.priceQty = v),
});
const profileId = computed({
  get: () => profileStore.activeId,
  set: (v) => (profileStore.activeId = v),
});

const rowsCount = computed(() => ui.totalRows);

function onFile(file: File) {
  emit('file', file);
}
function onInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) emit('file', file);
}

watch(
  profile,
  (p) => {
    if (!p) return;
    p.criteria.forEach((c) => {
      if (weights[c.name] === undefined) weights[c.name] = c.weight;
      if (!params[c.name]) params[c.name] = { ...(c.params || {}) };
    });
  },
  { immediate: true }
);
</script>
