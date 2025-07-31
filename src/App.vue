<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
@import "@/font/aliyunit/iconfont.css";

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  line-height: 1.5;
  color: #333;
}

input {
  border: 0;
  box-shadow: none;
  outline: none;
}

#app {
  font-family: DIN alternate, -apple-system, blinkmacsystemfont, Helvetica Neue,
    helvetica, segoe ui, arial, roboto, PingFang SC, miui, Hiragino Sans GB,
    Microsoft Yahei, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  border-radius: 10px;
  background-color: #fff;
}

::-webkit-scrollbar-thumb {
  border: 1px solid #fff;
  box-sizing: content-box;
  min-height: 20px;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.2);
  -webkit-transition: background-color 0.4s ease-in-out 0s;
  transition: background-color 0.4s ease-in-out 0s;
}

::-webkit-scrollbar-thumb:active,
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 106, 115, 0.8);
}

::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: #fff;
  background: transparent;
  opacity: 0;
}

::-webkit-scrollbar-button {
  display: none;
}
</style>
