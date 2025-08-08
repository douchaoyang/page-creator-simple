<template>
  <div class="attr-config">
    <div class="attr-box">
      <div class="attr-title">Control</div>
      <div class="attr-item">
        <div class="attr-control">
          <span @click="handler('up')" class="up">
            <i class="iconfont icon-APIshuchu"></i>上移
          </span>
          <span @click="handler('down')" class="down">
            <i class="iconfont icon-APIjieru"></i>下移
          </span>
          <span @click="handler('del')" class="delete">
            <i class="iconfont icon-shanchu"></i>删除
          </span>
        </div>
      </div>
      <div class="attr-title">Attribute</div>
      <div class="attr-item" v-if="'x' in el">
        <div class="left">
          <p class="label">Left</p>
        </div>
        <div class="right">
          <el-input v-model="el.x"></el-input>
        </div>
      </div>
      <div class="attr-item" v-if="'y' in el">
        <div class="left">
          <p class="label">Top</p>
        </div>
        <div class="right">
          <el-input v-model="el.y"></el-input>
        </div>
      </div>
      <div class="attr-item" v-if="'width' in el">
        <div class="left">
          <p class="label">Width</p>
        </div>
        <div class="right">
          <el-input v-model="el.width"></el-input>
        </div>
      </div>
      <div class="attr-item" v-if="'height' in el">
        <div class="left">
          <p class="label">Height</p>
        </div>
        <div class="right">
          <el-input v-model="el.height"></el-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["el"],
  methods: {
    handler(c) {
      this.$emit("handler", c);
    },
  },
};
</script>

<style>
</style>