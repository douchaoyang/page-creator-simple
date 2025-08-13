<template>
  <div class="editor-left">
    <div class="schema">
      <p class="schema-title">Components</p>
      <ul>
        <li
          v-for="(item, index) in Constructor"
          :key="index"
          draggable
          @dragstart="dragstart"
          :name="item.name"
        >
          <i :class="['iconfont', item.icon]"></i>
          {{ item.label }}
        </li>
      </ul>
    </div>
    <div class="layer"></div>
  </div>
</template>

<script>
import * as Constructor from "@/schema";

export default {
  data() {
    return {
      Constructor,
    };
  },

  methods: {
    dragstart(e) {
      e.dataTransfer.setData("text/plain", e.target.getAttribute("name"));
      e.dataTransfer.effectAllowed = "move";
    },
  },
};
</script>

<style>
</style>