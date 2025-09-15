<template>
  <div>
    <v-file-input label="CSV" accept=".csv" @change="onFile" hide-details></v-file-input>
    <v-select
      v-if="profiles.length"
      :items="profiles"
      item-title="id"
      item-value="id"
      v-model="profileId"
      label="Profile"
      hide-details
    ></v-select>
    <v-data-table
      v-if="rows.length"
      :headers="headers"
      :items="rows"
      :sort-by="[{ key: 'score', order: 'desc' }]"
      class="mt-4"
    >
      <template #item.score="{ item }">{{ item.score?.toFixed(3) }}</template>
      <template #item.why="{ item }">
        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-help-circle"></v-btn>
          </template>
          <v-list>
            <v-list-item v-for="(v, k) in item.explain" :key="k">
              {{ k }}: {{ v.toFixed(3) }}
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-data-table>
    <v-btn v-if="rows.length" class="mt-2" @click="exportCsv">Export</v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Papa from 'papaparse';
import { useProfileStore } from '../store/profile';
import { normalizeRow } from '../lib/csv/normalize';
import { scoreRow } from '../lib/scoring/engine';
import type { Profile } from '../lib/scoring/types';

const store = useProfileStore();
const rawRows = ref<Record<string, string>[]>([]);
const rows = ref<any[]>([]);
const profiles = computed(() => store.allProfiles);
const profileId = computed({
  get: () => store.activeId,
  set: (v) => (store.activeId = v),
});

const headers = computed(() => {
  const p = store.active;
  if (!p) return [];
  const cols = ['score', ...p.columns, 'why'];
  return cols.map((c) => ({ key: c === 'why' ? 'why' : c, title: c === 'score' ? 'Score' : c === 'why' ? 'Why?' : c }));
});

function onFile(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete(res) {
      rawRows.value = res.data as any[];
      const fields = res.meta.fields || [];
      const cats = rawRows.value.map((r) => (r.Category || r.category || '') as string);
      const detected = store.detectProfile(fields, cats);
      if (detected) store.activeId = detected.id;
      recompute();
    },
  });
}

function recompute() {
  const p = store.active;
  if (!p) return;
  const prof: Profile = JSON.parse(JSON.stringify(p));
  prof.criteria = prof.criteria.map((c) => ({
    ...c,
    weight: store.weights[c.name] ?? c.weight,
    params: { ...c.params, ...(store.params[c.name] || {}) },
  }));
  rows.value = rawRows.value.map((r) => {
    const norm = normalizeRow(r, prof, store.priceQty);
    return scoreRow(norm, prof);
  });
}

function exportCsv() {
  const data = rows.value.map((r) => ({ ...r, ...r.explain }));
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'scored.csv';
  a.click();
}

watch([() => store.active, rawRows, () => store.priceQty, () => store.weights, () => store.params], recompute, {
  deep: true,
});
</script>
