<template>
  <v-app>
    <v-main>
      <v-container fluid class="d-flex flex-column" style="height:100vh;">
        <ControlsPanel class="mb-4" />
        <DkScoredTable class="flex-grow-1" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import ControlsPanel from './components/ControlsPanel.vue';
import DkScoredTable from './components/DkScoredTable.vue';
</script>
