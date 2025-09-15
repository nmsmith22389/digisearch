<template>
  <v-app>
    <v-navigation-drawer app permanent width="300">
      <ControlsPanel />
    </v-navigation-drawer>
    <v-app-bar app color="primary" dark>
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
import ControlsPanel from './components/ControlsPanel.vue';
import DkScoredTable from './components/DkScoredTable.vue';
</script>
