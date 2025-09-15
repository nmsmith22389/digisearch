<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :permanent="display.mdAndUp.value"
      :temporary="!display.mdAndUp.value"
      width="360"
    >
      <ControlsPanel />
    </v-navigation-drawer>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />
      <v-toolbar-title>DigiSearch</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container fluid class="pa-4">
        <DkScoredTable />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
import ControlsPanel from './components/ControlsPanel.vue';
import DkScoredTable from './components/DkScoredTable.vue';

const display = useDisplay();
const drawer = ref(display.mdAndUp.value);
</script>
