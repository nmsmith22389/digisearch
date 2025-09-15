import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import yaml from 'js-yaml';
import type { Profile } from '../lib/scoring/types';

const modules = import.meta.glob<string>('../../profiles/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const loaded: Profile[] = Object.values(modules).map((raw) => yaml.load(raw) as Profile);

export const useProfileStore = defineStore('profile', () => {
  const allProfiles = loaded;
  const activeId = ref<string | undefined>(localStorage.getItem('profileId') || allProfiles[0]?.id);
  const priceQty = ref(Number(localStorage.getItem('priceQty') || '1'));
  const weights = ref<Record<string, number>>(JSON.parse(localStorage.getItem('weights') || '{}'));
  const params = ref<Record<string, Record<string, number>>>(
    JSON.parse(localStorage.getItem('params') || '{}')
  );

  watch(
    [activeId, priceQty, weights, params],
    () => {
      localStorage.setItem('profileId', activeId.value || '');
      localStorage.setItem('priceQty', String(priceQty.value));
      localStorage.setItem('weights', JSON.stringify(weights.value));
      localStorage.setItem('params', JSON.stringify(params.value));
    },
    { deep: true }
  );

  const active = computed(() => allProfiles.find((p) => p.id === activeId.value));

  function detectProfile(headers: string[], categories: string[] = []): Profile | undefined {
    const lowerHeaders = headers.map((h) => h.toLowerCase());
    const lowerCats = categories.map((c) => c.toLowerCase());
    return allProfiles.find((p) => {
      const det = p.detect;
      if (!det) return false;
      if (det.anyColumn && !det.anyColumn.some((c) => lowerHeaders.includes(c.toLowerCase()))) return false;
      if (det.anyCategory && !det.anyCategory.some((c) => lowerCats.some((cat) => cat.includes(c.toLowerCase())))) return false;
      return true;
    });
  }

  return { allProfiles, activeId, active, priceQty, weights, params, detectProfile };
});
