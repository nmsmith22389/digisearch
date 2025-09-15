<template>
  <div v-if="profile">
    <v-text-field v-model.number="priceQty" label="Price Qty" type="number" hide-details></v-text-field>
    <div v-for="c in profile.criteria" :key="c.name" class="d-flex align-center mt-2">
      <span class="mr-2" style="width:120px">{{ c.name }}</span>
      <v-slider
        v-model.number="weights[c.name]"
        min="0"
        max="3"
        step="0.1"
        class="flex-grow-1"
        hide-details
      ></v-slider>
      <div v-if="c.params" class="d-flex">
        <v-text-field
          v-for="(v, k) in c.params"
          :key="k"
          v-model.number="params[c.name][k]"
          :label="k"
          type="number"
          class="ml-2"
          hide-details
        ></v-text-field>
      </div>
    </div>
  </div>
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
    if (!params[c.name]) params[c.name] = { ...c.params };
  });
}, { immediate: true });
</script>
