<script setup lang="ts">
import { ref } from 'vue';

const version = ref(require('@electron/remote').app.getVersion());
const remoteVersion = ref(version.value);

fetch('https://raw.githubusercontent.com/christopherwk210/tmcp/master/package.json')
.then(res => res.json())
.then(data => {
  remoteVersion.value = data.version;
})
.catch(() => remoteVersion.value = version.value);

function github() {
  require('@electron/remote').shell.openExternal('https://github.com/christopherwk210/tmcp');
}

function itch() {
  require('@electron/remote').shell.openExternal('https://topherlicious.itch.io/tmcp');
}
</script>

<template>
  <div class="tmcp-info">
    <img class="tmcp-logo" src="@/assets/tmcp_logo_256.png" />
    <h1>Topher's Modular<br>Command Palette</h1>
    <h3>v{{ version }}</h3>
    <p class="info-buttons">
      <button @click="github()">GitHub</button>
      <button @click="itch()">itch.io</button>
    </p>
    <h4 v-if="remoteVersion !== version" class="new-version-text">A new version is available on itch.io!</h4>
  </div>
</template>

<style scoped>
.tmcp-info {
  flex: 1;
  overflow: auto;
}

.tmcp-logo {
  display: block;
  height: 128px;
  margin: 0 auto;
  margin-top: 1em;
}

h1 {
  font-size: 1.5em;
  text-align: center;
  margin-bottom: 0.5em;
}

h3 {
  opacity: 0.9;
  text-align: center;
  font-size: 1.2em;
  margin-top: 0;
}

.new-version-text {
  text-align: center;
  color: var(--controlColor);
}

.info-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1em;
  margin-top: 2em;
}
</style>