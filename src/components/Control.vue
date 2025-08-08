<template>
  <div class="ref-control">
    <span @click="handler('up')"><i class="iconfont icon-APIshuchu"></i></span>
    <span @click="handler('down')"><i class="iconfont icon-APIjieru"></i></span>
    <span @click="handler('del')"><i class="iconfont icon-shanchu"></i></span>
  </div>
</template>

<script>
export default {
  methods: {
    handler(c) {
      this.$emit("handler", c);
    },
  },
};
</script>

<style>
</style>