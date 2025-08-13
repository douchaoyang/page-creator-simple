<template>
  <div class="editor-nav">
    <div class="nav-container">
      <div class="item">
        <p class="label">Width</p>
        <input type="text" v-model="config.pageWidth" placeholder="宽度" />
      </div>
      <div class="item">
        <p class="label">Height</p>
        <input type="text" v-model="config.pageHeight" placeholder="高度" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["config"],
  methods: {},
};
</script>

<style>
</style>