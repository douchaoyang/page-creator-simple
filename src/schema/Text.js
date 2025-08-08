import Element from "./Element";

export default class Text extends Element {
  static icon = "icon-xingzhuang-wenzi";
  static label = "文字";
  static name = "Text";
  tag = "text";
  category = "normal";
  content = "";
  width = 300;
  height = 40;
  constructor() {
    super();
  }
}
