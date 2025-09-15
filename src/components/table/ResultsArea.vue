<template>
  <v-row class="mb-4">
    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="xl" class="pa-4">
        <div class="d-flex flex-wrap align-center">
          <v-chip class="ma-1" color="primary" label>Total {{ ui.totalRows }}</v-chip>
          <v-chip class="ma-1" color="primary" label>Passed {{ ui.passedRows }}</v-chip>
          <v-chip class="ma-1" color="secondary" label>Dropped {{ ui.droppedRows }}</v-chip>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="xl" class="pa-4">
        <div class="d-flex flex-wrap">
          <v-chip
            v-for="c in profileCriteria"
            :key="c.name"
            class="ma-1"
            label
            color="primary"
          >
            {{ c.name }}: {{ c.weight }}
          </v-chip>
        </div>
      </v-card>
    </v-col>
  </v-row>
  <v-card elevation="2" rounded="xl" class="pa-4 d-flex flex-column">
    <v-toolbar flat class="px-0">
      <v-text-field
        v-model="ui.quickFilter"
        hide-details
        density="compact"
        placeholder="Search"
        prepend-inner-icon="mdi-magnify"
        style="max-width: 200px"
      />
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon="mdi-view-column" v-bind="props" aria-label="Columns" />
        </template>
        <v-list>
          <v-list-item v-for="h in headers" :key="h.key">
            <v-checkbox
              v-model="visible[h.key]"
              :label="h.title"
              density="compact"
            />
          </v-list-item>
        </v-list>
      </v-menu>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-tune" @click="$emit('controls')" aria-label="Controls" class="mr-2" />
      <v-tooltip text="Download CSV" location="bottom">
        <template #activator="{ props }">
          <v-btn color="primary" v-bind="props" prepend-icon="mdi-download" @click="exportCsv">Export</v-btn>
        </template>
      </v-tooltip>
    </v-toolbar>
    <v-divider class="mb-2" />
    <div class="flex-grow-1 overflow-y-auto">
      <v-data-table
        :headers="visibleHeaders"
        :items="filteredRows"
        :sort-by="[{ key: 'score', order: 'desc' }]"
        fixed-header
        :height="tableHeight"
      >
        <template #item.score="{ item }">
          <v-chip label color="primary">{{ item.score?.toFixed(3) }}</v-chip>
        </template>
        <template #item.price="{ item }">${{ formatPrice(item.price) }}</template>
        <template #item.stock="{ item }">{{ formatStock(item.stock) }}</template>
        <template #item.why="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-btn icon="mdi-help-circle" v-bind="props" aria-label="Why" />
            </template>
            <score-breakdown :row="item" :criteria="profileCriteria" />
          </v-menu>
        </template>
      </v-data-table>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, type Ref } from 'vue';
import Papa from 'papaparse';
import { useProfileStore } from '../../store/profile';
import { useUiStore } from '../../store/ui';
import ScoreBreakdown from './ScoreBreakdown.vue';
import { normalizeRow } from '../../lib/csv/normalize';
import { scoreRow } from '../../lib/scoring/engine';
import type { Profile } from '../../lib/scoring/types';
import { calcTableHeight } from '../../lib/util/layout';

const profileStore = useProfileStore();
const ui = useUiStore();

const rawRows = ref<Record<string, string>[]>([]);
const rows = ref<any[]>([]);

const profileCriteria = computed(() => profileStore.active?.criteria || []);

const headers = computed(() => {
  const p = profileStore.active;
  if (!p) return [];
  const cols = Array.from(new Set(['score', ...p.columns, 'why']));
  return cols.map((c) => ({ key: c === 'why' ? 'why' : c, title: c === 'score' ? 'Score' : c === 'why' ? 'Why?' : c }));
});

const visible = ui.visibleCols as unknown as Ref<Record<string, boolean>>;
const visibleHeaders = computed(() => headers.value.filter((h) => visible.value[h.key] !== false));

watch(headers, (hArr) => {
  hArr.forEach((h) => {
    if (visible.value[h.key] === undefined) visible.value[h.key] = true;
  });
});

const filteredRows = computed(() => {
  if (!ui.quickFilter) return rows.value;
  const q = ui.quickFilter.toLowerCase();
  return rows.value.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
});

const tableHeight = computed(() => calcTableHeight());

function formatPrice(val?: number) {
  if (val == null) return '';
  return val.toFixed(2);
}
function formatStock(val?: number) {
  if (val == null) return '';
  return val.toLocaleString();
}

function onFile(file: File) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete(res) {
      rawRows.value = res.data as any[];
      const fields = res.meta.fields || [];
      const cats = rawRows.value.map((r) => (r.Category || r.category || '') as string);
      const detected = profileStore.detectProfile(fields, cats);
      if (detected) profileStore.activeId = detected.id;
      ui.lastImport = new Date().toLocaleTimeString();
      recompute();
    },
  });
}

defineExpose({ onFile });

function recompute() {
  const p = profileStore.active;
  if (!p) return;
  const prof: Profile = JSON.parse(JSON.stringify(p));
  prof.criteria = prof.criteria.map((c) => ({
    ...c,
    weight: profileStore.weights[c.name] ?? c.weight,
    params: { ...(c.params || {}), ...(profileStore.params[c.name] || {}) },
  })) as Profile['criteria'];
  rows.value = rawRows.value.map((r) => {
    const norm = normalizeRow(r, prof, profileStore.priceQty);
    const scored = scoreRow(norm, prof);
    return { ...scored, ...(scored.attrs as Record<string, unknown>) };
  });
  ui.totalRows = rows.value.length;
  ui.passedRows = rows.value.filter((r) => r.score && r.score > 0).length;
  ui.droppedRows = ui.totalRows - ui.passedRows;
}

function exportCsv() {
  const data = rows.value.map((r) => {
    const { attrs, explain, ...rest } = r;
    return { ...rest, ...explain };
  });
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'scored.csv';
  a.click();
}

watch([() => profileStore.active, rawRows, () => profileStore.priceQty, () => profileStore.weights, () => profileStore.params], recompute, { deep: true });
</script>
