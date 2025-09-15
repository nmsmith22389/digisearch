<template>
  <v-app class="h-100">
    <v-navigation-drawer
      v-model="leftDrawer"
      :rail="mdAndUp"
      expand-on-hover
      :temporary="!mdAndUp"
    >
      <v-list density="compact">
        <v-list-subheader>Projects</v-list-subheader>
        <v-list-item title="Demo" prepend-icon="mdi-home" />
        <v-divider></v-divider>
        <v-list-subheader>Profiles</v-list-subheader>
        <v-list-item
          v-for="p in profileStore.allProfiles"
          :key="p.id"
          :title="p.id"
          prepend-icon="mdi-file"
          @click="profileStore.activeId = p.id"
        />
        <v-divider></v-divider>
        <v-list-subheader>Data</v-list-subheader>
        <v-list-item title="CSV" prepend-icon="mdi-table" />
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer
      v-model="rightDrawer"
      location="right"
      temporary
      width="360"
    >
      <v-toolbar flat>
        <v-toolbar-title>Controls</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-refresh" @click="$emit('reset')" aria-label="Reset"></v-btn>
      </v-toolbar>
      <controls-panel class="pa-2" @file="handleFile" />
    </v-navigation-drawer>

    <v-app-bar density="comfortable">
      <v-app-bar-nav-icon @click="leftDrawer = !leftDrawer" />
      <v-breadcrumbs :items="breadcrumbs" class="ml-2" />
      <v-spacer></v-spacer>
      <v-text-field
        v-model="ui.quickFilter"
        density="compact"
        hide-details
        placeholder="Quick filter"
        clearable
        prepend-inner-icon="mdi-magnify"
        style="max-width: 200px"
      />
      <v-tooltip text="Toggle theme" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            aria-label="Toggle theme"
            @click="toggleTheme"
          >
            <v-icon>{{ ui.theme === 'light' ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip text="Toggle density" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            aria-label="Toggle density"
            @click="toggleDensity"
          >
            <v-icon>{{ ui.density === 'compact' ? 'mdi-format-line-spacing' : 'mdi-view-compact-outline' }}</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-btn icon="mdi-tune" @click="rightDrawer = true" aria-label="Controls" />
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4">
        <results-area ref="resultsRef" @controls="rightDrawer = true" />
      </v-container>
    </v-main>

    <v-footer>
      <v-chip class="ma-2" label color="primary">Total: {{ ui.totalRows }}</v-chip>
      <v-chip class="ma-2" label color="primary">Passed: {{ ui.passedRows }}</v-chip>
      <v-chip class="ma-2" label color="secondary">Dropped: {{ ui.droppedRows }}</v-chip>
      <v-spacer></v-spacer>
      <v-chip class="ma-2" label>{{ profileStore.active?.id }}</v-chip>
      <v-chip class="ma-2" label v-if="ui.lastImport">{{ ui.lastImport }}</v-chip>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useDisplay, useTheme } from 'vuetify';
import ControlsPanel from '../ControlsPanel.vue';
import ResultsArea from '../table/ResultsArea.vue';
import { useProfileStore } from '../../store/profile';
import { useUiStore } from '../../store/ui';
import vuetify from '../../plugins/vuetify';

const leftDrawer = ref(false);
const rightDrawer = ref(false);
const profileStore = useProfileStore();
const ui = useUiStore();
const resultsRef = ref<InstanceType<typeof ResultsArea>>();

const breadcrumbs = computed(() => [{ title: 'Home' }, { title: 'CSV' }]);

const { mdAndUp } = useDisplay();
const theme = useTheme();

watch(
  () => ui.theme,
  (t) => {
    theme.change(t);
  },
  { immediate: true }
);

watch(
  () => ui.density,
  (d) => {
    const globals = (vuetify.defaults.value!.global ||= {} as any);
    globals.density = d as any;
  },
  { immediate: true }
);

function toggleTheme() {
  ui.theme = ui.theme === 'light' ? 'dark' : 'light';
}
function toggleDensity() {
  ui.density = ui.density === 'compact' ? 'comfortable' : 'compact';
}

function handleFile(file: File) {
  resultsRef.value?.onFile(file);
}
</script>
