<template>
  <v-list density="compact">
    <v-list-item v-for="c in criteria" :key="c.name">
      <v-list-item-title>{{ c.name }}</v-list-item-title>
      <v-list-item-subtitle>
        <v-progress-linear :model-value="(row.explain?.[c.name] || 0) * 100" height="6" class="mb-1" />
        <span class="text-caption">{{ valueOf(c.field) }}</span>
      </v-list-item-subtitle>
      <template #append>
        <v-tooltip :text="c.type">
          <template #activator="{ props }">
            <v-icon icon="mdi-information-outline" v-bind="props" />
          </template>
        </v-tooltip>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import type { Criterion } from '../../lib/scoring/types';

const props = defineProps<{ row: any; criteria: Criterion[] }>();

function valueOf(field: string) {
  return props.row[field] ?? props.row.attrs?.[field] ?? '';
}
</script>
