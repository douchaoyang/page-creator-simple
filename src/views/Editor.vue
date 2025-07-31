<template>
  <div class="editor-main">
    <div class="editor-nav">
      <div class="nav-container">
        <div class="item">
          <p class="label">Width</p>
          <input type="text" v-model="paintWidth" placeholder="宽度" />
        </div>
        <div class="item">
          <p class="label">Height</p>
          <input type="text" v-model="paintHeight" placeholder="高度" />
        </div>
      </div>
    </div>
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
        :style="{ width: `${paintWidth}px`, height: `${paintHeight}px` }"
        @dragover="dragover"
        @drop="drop"
      >
        <div class="ref-x-line"></div>
        <div class="ref-y-line"></div>
        <div
          :class="['el', item.tag, item.id == selected && 'selected']"
          :style="{
            left: `${item.x}px`,
            top: `${item.y}px`,
          }"
          :id="item.id"
          :index="index"
          @click="selectEl(index)"
          @mousedown="elmousedown"
          @mousemove="elmousemove"
          @mouseleave="elmouseup"
          @mouseup="elmouseup"
          v-for="(item, index) in elements"
          :key="index"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import * as Constructor from "@/schema";

export default {
  data() {
    return {
      rectWidth: 0,
      rectHeight: 0,
      paintWidth: 1920,
      paintHeight: 1080,
      zoom: 1,
      minZoom: 1,
      maxZoom: 3,
      scroller: null,
      rect: null,
      paint: null,
      mousedown: false,
      spacedown: false,
      Constructor,
      elements: [
        {
          x: 200,
          y: 200,
        },
      ],
      selected: -1,
      elSpread: 5,
      elStartX: 0,
      elStartY: 0,
      elStartPosX: 0,
      elStartPosY: 0,
      elMoving: false,
      moveArray: [],
      stayArray: [],
    };
  },
  watch: {
    paintWidth() {
      this.reflow();
    },
    paintHeight() {
      this.reflow();
    },
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
      this.minZoom = Math.min(1, this.rectWidth / this.paintWidth);

      this.$nextTick(() => {
        this.scroller.setDimensions(
          this.rectWidth,
          this.rectHeight,
          parseInt(this.paintWidth),
          parseInt(this.paintHeight)
        );

        this.zoom = this.minZoom;
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
        },
        false
      );

      this.rect.addEventListener(
        navigator.userAgent.indexOf("Firefox") > -1
          ? "DOMMouseScroll"
          : "mousewheel",
        function (e) {
          const zoomin = (e.detail ? e.detail * 120 : -e.wheelDelta) > 0;
          if (
            (zoomin && self.minZoom < self.scroller.getValues().zoom) ||
            !zoomin
          ) {
            self.scroller.doMouseZoom(
              e.detail ? e.detail * 120 : -e.wheelDelta,
              e.timeStamp,
              e.pageX,
              e.pageY
            );
          }
        },
        false
      );

      $(document).on("click", function (e) {
        if (!$(e.target).hasClass("el")) {
          self.selected = -1;
        }
      });
    },
    dragstart(e) {
      e.dataTransfer.setData("text/plain", e.target.getAttribute("name"));
      e.dataTransfer.effectAllowed = "move";
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
      this.elements.push(el);
    },
    getMinX(move, stay) {
      for (var i = 0, l = move.length; i < l; i++) {
        for (var j = 0, k = stay.length; j < k; j++) {
          if (Math.abs(move[i].x - stay[j].x) < this.getLen(this.elSpread)) {
            return { key: i, val: stay[j].x };
          }
        }
      }
      return null;
    },
    getMinY(move, stay) {
      for (var i = 0, l = move.length; i < l; i++) {
        for (var j = 0, k = stay.length; j < k; j++) {
          if (Math.abs(move[i].y - stay[j].y) < this.getLen(this.elSpread)) {
            return { key: i, val: stay[j].y };
          }
        }
      }
      return null;
    },
    getLen(l) {
      return Math.round(l / this.zoom);
    },
    elmousedown(e) {
      if (this.spacedown) {
        return false;
      }

      this.elStartX = e.clientX;
      this.elStartY = e.clientY;
      this.elMoving = true;
      this.elStartPosX = parseInt(e.currentTarget.style.left);
      this.elStartPosY = parseInt(e.currentTarget.style.top);
      $(e.currentTarget).addClass("ghost");

      this.stayArray = [
        { x: 0, y: 0 },
        {
          x: parseInt($("#paint").outerWidth() / 2),
          y: parseInt($("#paint").outerHeight() / 2),
        },
        {
          x: parseInt($("#paint").outerWidth()),
          y: parseInt($("#paint").outerHeight()),
        },
      ];
      const boxs = $("#paint>.el");
      for (let i = 0; i < boxs.length; i++) {
        if (
          !$(boxs[i]).hasClass("ghost") &&
          !$(boxs[i]).hasClass("ref-x-line") &&
          !$(boxs[i]).hasClass("ref-y-line")
        ) {
          this.stayArray = this.stayArray.concat([
            {
              x: parseInt(boxs[i].style.left),
              y: parseInt(boxs[i].style.top),
            },
            {
              x:
                parseInt(boxs[i].style.left) +
                parseInt($(boxs[i]).outerWidth() / 2),
              y:
                parseInt(boxs[i].style.top) +
                parseInt($(boxs[i]).outerHeight() / 2),
            },
            {
              x:
                parseInt(boxs[i].style.left) +
                parseInt($(boxs[i]).outerWidth()),
              y:
                parseInt(boxs[i].style.top) +
                parseInt($(boxs[i]).outerHeight()),
            },
          ]);
        }
      }
    },
    elmousemove(e) {
      if (!this.elMoving) {
        return false;
      }

      e.currentTarget.style.left =
        this.elStartPosX + this.getLen(e.clientX - this.elStartX) + "px";
      e.currentTarget.style.top =
        this.elStartPosY + this.getLen(e.clientY - this.elStartY) + "px";

      this.moveArray = [
        {
          x: parseInt(e.currentTarget.style.left),
          y: parseInt(e.currentTarget.style.top),
        },
        {
          x:
            parseInt(e.currentTarget.style.left) +
            parseInt($(e.currentTarget).outerWidth() / 2),
          y:
            parseInt(e.currentTarget.style.top) +
            parseInt($(e.currentTarget).outerHeight() / 2),
        },
        {
          x:
            parseInt(e.currentTarget.style.left) +
            parseInt($(e.currentTarget).outerWidth()),
          y:
            parseInt(e.currentTarget.style.top) +
            parseInt($(e.currentTarget).outerHeight()),
        },
      ];

      const minX = this.getMinX(this.moveArray, this.stayArray);
      if (minX !== null) {
        $("#paint .ref-x-line")
          .css("left", minX.val + "px")
          .show();
        if (minX.key == 0) {
          // 如果是 ‘左上’
          e.currentTarget.style.left = minX.val + "px";
        } else if (minX.key == 1) {
          // 如果是 ‘中心’
          e.currentTarget.style.left =
            parseInt(minX.val - $(e.currentTarget).outerWidth() / 2) + "px";
        } else {
          // 如果是 ‘右下’
          e.currentTarget.style.left =
            parseInt(minX.val - $(e.currentTarget).outerWidth()) + "px";
        }
      } else {
        $("#paint .ref-x-line").hide();
      }

      const minY = this.getMinY(this.moveArray, this.stayArray);
      if (minY !== null) {
        $("#paint .ref-y-line")
          .css("top", minY.val + "px")
          .show();
        if (minY.key == 0) {
          // 如果是 ‘左上’
          e.currentTarget.style.top = minY.val + "px";
        } else if (minY.key == 1) {
          // 如果是 ‘中心’
          e.currentTarget.style.top =
            parseInt(minY.val - $(e.currentTarget).outerHeight() / 2) + "px";
        } else {
          // 如果是 ‘右下’
          e.currentTarget.style.top =
            parseInt(minY.val - $(e.currentTarget).outerHeight()) + "px";
        }
      } else {
        $("#paint .ref-y-line").hide();
      }

      const index = parseInt($(e.currentTarget).attr("index"));
      this.$set(this.elements, index, {
        ...this.elements[index],
        x: parseInt(e.currentTarget.style.left),
        y: parseInt(e.currentTarget.style.top),
      });
    },
    elmouseup(e) {
      this.elMoving = false;
      $(e.currentTarget).removeClass("ghost");
      $("#paint .ref-x-line,#paint .ref-y-line").hide();
    },
    selectEl(id) {
      this.selected = id;
    },
  },
  mounted() {
    this.init();
    this.reflow();
    this.bind();
  },
};
</script>
<style lang="scss">
@import "@/style/editor.scss";
</style>
