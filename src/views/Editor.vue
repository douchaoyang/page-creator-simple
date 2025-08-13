<template>
  <div class="editor-main">
    <editor-nav :config="form.config"></editor-nav>
    <editor-left></editor-left>
    <editor-right>
      <attr-config
        v-if="selected != -1"
        :item="form.widgets[selected]"
        @handler="handlerControl"
      ></attr-config>
    </editor-right>
    <editor-rect
      :config="form.config"
      @zoom="zoomHandler"
      @spacedown="spacedownHandler"
      @createElement="createElement"
    >
      <assist></assist>
      <shape
        v-for="(item, index) in form.widgets"
        :key="index"
        :item="item"
        :index="index"
        :selected="selected"
        :zoom="zoom"
        :freeze="spacedown"
        @select="selectHandler"
      >
      </shape>
    </editor-rect>
  </div>
</template>

<script>
// @ is an alias to /src
import AttrConfig from "@/components/AttrConfig.vue";
import EditorNav from "@/components/EditorNav.vue";
import EditorLeft from "@/components/EditorLeft.vue";
import EditorRight from "@/components/EditorRight.vue";
import EditorRect from "@/components/EditorRect.vue";
import Assist from "@/components/Assist.vue";
import Shape from "@/components/Shape.vue";

export default {
  components: {
    AttrConfig,
    EditorNav,
    EditorLeft,
    EditorRight,
    EditorRect,
    Assist,
    Shape,
  },
  data() {
    return {
      form: {
        config: {
          pageWidth: 1920,
          pageHeight: 1080,
        },
        widgets: [],
      },
      zoom: 1,
      selected: -1,
      spacedown: false,
    };
  },
  methods: {
    zoomHandler(z) {
      this.zoom = z;
    },
    spacedownHandler(s) {
      this.spacedown = s;
    },
    selectHandler(index) {
      this.selected = index;
    },
    createElement(el) {
      this.form.widgets.push(el);
    },
    handlerControl(c) {
      if (this.selected != -1) {
        if (c == "up") {
          if (this.selected < this.form.widgets.length - 1) {
            const temp = this.form.widgets[this.selected];
            this.$set(
              this.form.widgets,
              this.selected,
              this.form.widgets[this.selected + 1]
            );
            this.$set(this.form.widgets, this.selected + 1, temp);
            this.selected += 1;
          }
        }
        if (c == "down") {
          if (this.selected > 0) {
            const temp = this.form.widgets[this.selected];
            this.$set(
              this.form.widgets,
              this.selected,
              this.form.widgets[this.selected - 1]
            );
            this.$set(this.form.widgets, this.selected - 1, temp);
            this.selected -= 1;
          }
        }
        if (c == "del") {
          this.form.widgets.splice(this.selected, 1);
          this.selected = -1;
        }
      }
    },
  },
};
</script>
<style lang="stylus"></style>
