<template>
  <v-card v-if="profile" flat class="pa-4">
    <p class="text-body-2 mb-4">
      Adjust scoring weights and parameters. Hover labels for help.
    </p>
    <v-text-field
      v-model.number="priceQty"
      label="Price Qty"
      type="number"
      class="mb-4"
      hint="Select quantity to choose price column"
      persistent-hint
      hide-details
    ></v-text-field>
    <div v-for="c in profile.criteria" :key="c.name" class="mb-4">
      <div class="d-flex align-center">
        <v-tooltip location="top">
          <template #activator="{ props }">
            <span v-bind="props" class="mr-2" style="width:120px">{{ c.name }}</span>
          </template>
          <span>Weight for {{ c.name }}</span>
        </v-tooltip>
        <v-slider
          v-model.number="weights[c.name]"
          min="0"
          max="3"
          step="0.1"
          class="flex-grow-1"
          color="primary"
          thumb-label="always"
          hide-details
        ></v-slider>
      </div>
      <div v-if="c.params" class="d-flex mt-2">
        <v-text-field
          v-for="(_, k) in c.params"
          :key="k"
          v-model.number="params[c.name][k]"
          :label="k"
          type="number"
          class="mr-2"
          hint="Parameter {{ k }} for {{ c.name }}"
          persistent-hint
          hide-details
        ></v-text-field>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useProfileStore } from '../store/profile';

const store = useProfileStore();
const profile = computed(() => store.active);

const weights = store.weights;
const params = store.params as any;
const priceQty = computed({
  get: () => store.priceQty,
  set: (v) => (store.priceQty = v),
});

watch(profile, (p) => {
  if (!p) return;
  p.criteria.forEach((c) => {
    if (weights[c.name] === undefined) weights[c.name] = c.weight;
    if (!params[c.name]) params[c.name] = { ...(c.params || {}) };
  });
}, { immediate: true });
</script>
