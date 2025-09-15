import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const quickFilter = ref('');
  const theme = ref(localStorage.getItem('theme') || 'light');
  const density = ref(localStorage.getItem('density') || 'compact');
  const visibleCols = ref<Record<string, boolean>>(
    JSON.parse(localStorage.getItem('visibleCols') || '{}')
  );
  const totalRows = ref(0);
  const passedRows = ref(0);
  const droppedRows = ref(0);
  const lastImport = ref<string | undefined>();

  watch(
    [theme, density, visibleCols],
    () => {
      localStorage.setItem('theme', theme.value);
      localStorage.setItem('density', density.value);
      localStorage.setItem('visibleCols', JSON.stringify(visibleCols.value));
    },
    { deep: true }
  );

  return {
    quickFilter,
    theme,
    density,
    visibleCols,
    totalRows,
    passedRows,
    droppedRows,
    lastImport,
  };
});
