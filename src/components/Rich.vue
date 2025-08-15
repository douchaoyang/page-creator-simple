<template>
  <div id="rich-container">
    <div id="rich-toolbar"></div>
    <div id="rich-editor"></div>
  </div>
</template>

<script>
const E = window.wangEditor;

const replaceToolbarIcon = (toolbar) => {
  Promise.resolve().then(() => {
    const menus = ["fontSize", "lineHeight"];
    const { toolbarKeys: keys } = toolbar.getConfig();
    menus.forEach((menu) => {
      const i = keys.findIndex((e) => e === menu);
      if (i > -1) {
        const item = toolbar.toolbarItems[i];
        if (item.menu.tag == "select")
          item.setSelectedValue = function () {
            const { $button: button } = this;
            button.empty();
            button.css("width", "auto");
            button.append(this.menu.iconSvg);
          };
        else {
          const button = item.$button;
          button.empty();
          button.append(item.menu.iconSvg);
        }
      }
    });
  });
};

export default {
  data() {
    return {
      editor: null,
      toolbar: null,
    };
  },
  methods: {},
  mounted() {
    const self = this;

    const editorConfig = {
      autoFocus: false,
      placeholder: "请输入内容...",
      onChange(editor) {
        const html = editor.getHtml();
      },
      onCreated(editor) {
        replaceToolbarIcon(self.toolbar);
      },
    };

    const toolbarConfig = {
      modalAppendToBody: true,
      toolbarKeys: [
        "fontSize",
        "justifyLeft",
        "justifyCenter",
        "justifyRight",
        "justifyJustify",
        "bold",
        "underline",
        "italic",
        "lineHeight",
      ],
    };

    const e = E.createEditor({
      selector: "#rich-editor",
      html: "<p><br></p>",
      config: editorConfig,
      mode: "simple",
    });

    this.editor = Object.seal(e);

    this.toolbar = E.createToolbar({
      editor: this.editor,
      selector: "#rich-toolbar",
      config: toolbarConfig,
      mode: "simple",
    });
  },
};
</script>

<style>
</style>