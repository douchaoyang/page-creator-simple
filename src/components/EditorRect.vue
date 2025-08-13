<template>
  <div
    :class="[
      'editor-rect',
      `${spacedown ? (mousedown ? 'grabbing' : 'grab') : 'default'}`,
    ]"
    id="rect"
  >
    <div
      class="editor-paint"
      id="paint"
      :style="{
        width: `${config.pageWidth}px`,
        height: `${config.pageHeight}px`,
      }"
      @dragover="dragover"
      @drop="drop"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
import * as Constructor from "@/schema";

export default {
  props: ["config"],
  watch: {
    "config.pageWidth": {
      handler: () => {
        this.reflow();
      },
    },
    "config.pageHeight": {
      handler: () => {
        this.reflow();
      },
    },
  },
  data() {
    return {
      rectWidth: 0,
      rectHeight: 0,
      zoom: 1,
      minZoom: 1,
      maxZoom: 3,
      scroller: null,
      rect: null,
      paint: null,
      mousedown: false,
      spacedown: false,
      Constructor,
    };
  },
  methods: {
    init() {
      this.rect = document.getElementById("rect");
      this.paint = document.getElementById("paint");

      const render = (left, top, zoom) => {
        this.paint.style[
          "transform"
        ] = `translate3d(${-left}px, ${-top}px, 0) scale(${zoom})`;
        this.zoom = zoom;
        this.$emit("zoom", zoom);
      };

      this.scroller = new Scroller(render, {
        zooming: true,
        minZoom: 0.01,
        maxZoom: this.maxZoom,
      });

      this.scroller.setPosition(200, 56);
    },
    reflow() {
      this.rectWidth = this.rect.clientWidth;
      this.rectHeight = this.rect.clientHeight;
      this.minZoom = Math.min(1, this.rectWidth / this.config.pageWidth);

      this.$nextTick(() => {
        this.scroller.setDimensions(
          this.rectWidth,
          this.rectHeight,
          parseInt(this.config.pageWidth),
          parseInt(this.config.pageHeight)
        );
        this.zoom = this.minZoom;
        this.$emit("zoom", this.minZoom);
        this.scroller.zoomTo(this.minZoom, false);
        this.scroller.scrollTo(0, 0, false);
      });
    },
    bind() {
      const self = this;

      window.addEventListener("resize", this.reflow, false);

      document.addEventListener(
        "keydown",
        function (e) {
          if (e.target.tagName.match(/input|textarea|select/i)) {
            return;
          }
          if (e.key == " ") {
            self.spacedown = true;
            self.$emit("spacedown", self.spacedown);
          }
        },
        false
      );

      document.addEventListener(
        "keyup",
        function (e) {
          if (e.target.tagName.match(/input|textarea|select/i)) {
            return;
          }
          if (e.key == " ") {
            self.spacedown = false;
            self.$emit("spacedown", self.spacedown);
          }
        },
        false
      );

      this.rect.addEventListener(
        "mousedown",
        function (e) {
          if (
            e.target.tagName.match(/input|textarea|select/i) ||
            !self.spacedown
          ) {
            return;
          }
          self.scroller.doTouchStart(
            [
              {
                pageX: e.pageX,
                pageY: e.pageY,
              },
            ],
            e.timeStamp
          );
          self.mousedown = true;
          self.$emit("mousedown", self.mousedown);
        },
        false
      );

      document.addEventListener(
        "mousemove",
        function (e) {
          if (!self.mousedown || !self.spacedown) {
            return;
          }
          self.scroller.doTouchMove(
            [
              {
                pageX: e.pageX,
                pageY: e.pageY,
              },
            ],
            e.timeStamp
          );
          self.mousedown = true;
          self.$emit("mousedown", self.mousedown);
        },
        false
      );

      document.addEventListener(
        "mouseup",
        function (e) {
          if (!self.mousedown) {
            return;
          }
          self.scroller.doTouchEnd(e.timeStamp);
          self.mousedown = false;
          self.$emit("mousedown", self.mousedown);
        },
        false
      );

      this.rect.addEventListener(
        navigator.userAgent.indexOf("Firefox") > -1
          ? "DOMMouseScroll"
          : "mousewheel",
        function (e) {
          const zoomin = (e.detail ? e.detail * 40 : -e.wheelDelta) > 0;
          if (
            (zoomin && self.minZoom < self.scroller.getValues().zoom) ||
            !zoomin
          ) {
            self.scroller.doMouseZoom(
              e.detail ? e.detail * 40 : -e.wheelDelta,
              e.timeStamp,
              e.pageX,
              e.pageY
            );
          }
        },
        false
      );
    },
    dragover(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    drop(e) {
      e.preventDefault();
      const name = e.dataTransfer.getData("text/plain");
      if (Constructor[name]) {
        this.createElement(
          new Constructor[name](),
          parseInt((e.clientX - $("#paint").offset().left) / this.zoom),
          parseInt((e.clientY - $("#paint").offset().top) / this.zoom)
        );
      }
    },
    createElement(el, x, y) {
      el.x = x;
      el.y = y;
      console.log(el);
      this.$emit("createElement", el);
    },
  },
  mounted() {
    this.init();
    this.reflow();
    this.bind();
  },
};
</script>

<style>
</style>