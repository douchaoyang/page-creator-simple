import Element from "./Element";

export default class Text extends Element {
  static icon = "icon-xingzhuang-wenzi";
  static label = "文字";
  static name = "Text";

  tag = "text";
  category = "normal";
  content = "";
  constructor() {
    super();
  }
}
