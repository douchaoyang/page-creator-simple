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
    <div class="editor-right">
      <attr-config
        v-if="selected != -1"
        :el="elements[selected]"
        @handler="handlerControl"
      ></attr-config>
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
          :class="['el', item.tag, index == selected && 'selected']"
          :style="{
            width: `${item.width}px`,
            height: `${item.height}px`,
            left: `${item.x}px`,
            top: `${item.y}px`,
          }"
          :id="item.id"
          :index="index"
          @mousedown="elmousedown"
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
import AttrConfig from "@/components/AttrConfig.vue";

export default {
  components: {
    AttrConfig,
  },
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
      elements: [],
      selected: -1,
      elSpread: 5,
      elStartX: 0,
      elStartY: 0,
      elStartPosX: 0,
      elStartPosY: 0,
      elTimestamp: 0,
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
      const el = e.currentTarget;
      if (this.spacedown) {
        return false;
      }

      this.elTimestamp = new Date().getTime();

      this.elStartX = e.clientX;
      this.elStartY = e.clientY;
      this.elMoving = true;
      this.elStartPosX = parseInt(el.style.left);
      this.elStartPosY = parseInt(el.style.top);
      $(el).addClass("ghost");

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
          !$(boxs[i]).hasClass("ref-y-line") &&
          !$(boxs[i]).hasClass("ref-control")
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

      const move = (e) => {
        if (!this.elMoving) {
          return false;
        }

        el.style.left =
          this.elStartPosX + this.getLen(e.clientX - this.elStartX) + "px";
        el.style.top =
          this.elStartPosY + this.getLen(e.clientY - this.elStartY) + "px";

        this.moveArray = [
          {
            x: parseInt(el.style.left),
            y: parseInt(el.style.top),
          },
          {
            x: parseInt(el.style.left) + parseInt($(el).outerWidth() / 2),
            y: parseInt(el.style.top) + parseInt($(el).outerHeight() / 2),
          },
          {
            x: parseInt(el.style.left) + parseInt($(el).outerWidth()),
            y: parseInt(el.style.top) + parseInt($(el).outerHeight()),
          },
        ];

        const minX = this.getMinX(this.moveArray, this.stayArray);
        if (minX !== null) {
          $("#paint .ref-x-line")
            .css("left", minX.val + "px")
            .show();
          if (minX.key == 0) {
            // 如果是 ‘左上’
            el.style.left = minX.val + "px";
          } else if (minX.key == 1) {
            // 如果是 ‘中心’
            el.style.left = parseInt(minX.val - $(el).outerWidth() / 2) + "px";
          } else {
            // 如果是 ‘右下’
            el.style.left = parseInt(minX.val - $(el).outerWidth()) + "px";
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
            el.style.top = minY.val + "px";
          } else if (minY.key == 1) {
            // 如果是 ‘中心’
            el.style.top = parseInt(minY.val - $(el).outerHeight() / 2) + "px";
          } else {
            // 如果是 ‘右下’
            el.style.top = parseInt(minY.val - $(el).outerHeight()) + "px";
          }
        } else {
          $("#paint .ref-y-line").hide();
        }

        const index = parseInt($(el).attr("index"));
        this.$set(this.elements, index, {
          ...this.elements[index],
          x: parseInt(el.style.left),
          y: parseInt(el.style.top),
        });
      };

      const up = (e) => {
        if (this.elTimestamp && new Date().getTime() - this.elTimestamp < 300) {
          this.selectEl(parseInt($(el).attr("index")));
        }
        this.elTimestamp = 0;
        this.elMoving = false;
        $(el).removeClass("ghost");
        $("#paint .ref-x-line,#paint .ref-y-line").hide();
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    },
    selectEl(id) {
      if (id == this.selected) {
        this.selected = -1;
      } else {
        this.selected = id;
      }
    },
    handlerControl(c) {
      if (this.selected != -1) {
        if (c == "up") {
          if (this.selected < this.elements.length - 1) {
            const temp = this.elements[this.selected];
            this.$set(
              this.elements,
              this.selected,
              this.elements[this.selected + 1]
            );
            this.$set(this.elements, this.selected + 1, temp);
            this.selected += 1;
          }
        }
        if (c == "down") {
          if (this.selected > 0) {
            const temp = this.elements[this.selected];
            this.$set(
              this.elements,
              this.selected,
              this.elements[this.selected - 1]
            );
            this.$set(this.elements, this.selected - 1, temp);
            this.selected -= 1;
          }
        }
        if (c == "del") {
          this.elements.splice(this.selected, 1);
          this.selected = -1;
        }
      }
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
