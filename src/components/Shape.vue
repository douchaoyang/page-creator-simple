<template>
  <div
    :class="['shape', item.tag, index == selected && 'selected']"
    :style="{
      width: `${item.width}px`,
      height: `${item.height}px`,
      left: `${item.x}px`,
      top: `${item.y}px`,
    }"
    :id="item.id"
    :index="index"
    @mousedown="mousedown"
  ></div>
</template>

<script>
export default {
  props: ["item", "index", "selected", "freeze", "zoom"],
  data() {
    return {
      spread: 5,
      startX: 0,
      startY: 0,
      startPosX: 0,
      startPosY: 0,
      timestamp: 0,
      moving: false,
      moveArray: [],
      stayArray: [],
    };
  },
  methods: {
    getMinX(move, stay) {
      for (var i = 0, l = move.length; i < l; i++) {
        for (var j = 0, k = stay.length; j < k; j++) {
          if (Math.abs(move[i].x - stay[j].x) < this.getLen(this.spread)) {
            return { key: i, val: stay[j].x };
          }
        }
      }
      return null;
    },
    getMinY(move, stay) {
      for (var i = 0, l = move.length; i < l; i++) {
        for (var j = 0, k = stay.length; j < k; j++) {
          if (Math.abs(move[i].y - stay[j].y) < this.getLen(this.spread)) {
            return { key: i, val: stay[j].y };
          }
        }
      }
      return null;
    },
    getLen(l) {
      return Math.round(l / this.zoom);
    },
    select(index) {
      this.$emit("select", index);
    },
    mousedown(e) {
      const el = e.currentTarget;

      if (this.freeze) {
        return false;
      }

      this.timestamp = new Date().getTime();

      this.startX = e.clientX;
      this.startY = e.clientY;
      this.moving = true;
      this.startPosX = parseInt(el.style.left);
      this.startPosY = parseInt(el.style.top);
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

      const boxs = $("#paint .shape");
      for (let i = 0; i < boxs.length; i++) {
        if (
          !$(boxs[i]).hasClass("ghost") &&
          !$(boxs[i]).hasClass("assistance")
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
        if (!this.moving) {
          return false;
        }

        el.style.left =
          this.startPosX + this.getLen(e.clientX - this.startX) + "px";
        el.style.top =
          this.startPosY + this.getLen(e.clientY - this.startY) + "px";

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

        this.item.x = parseInt(el.style.left);
        this.item.y = parseInt(el.style.top);
      };

      const up = (e) => {
        if (this.timestamp && new Date().getTime() - this.timestamp < 300) {
          this.select(parseInt(this.index));
        }
        this.timestamp = 0;
        this.moving = false;
        $(el).removeClass("ghost");
        $("#paint .ref-x-line,#paint .ref-y-line").hide();
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    },
  },
};
</script>

<style>
</style>