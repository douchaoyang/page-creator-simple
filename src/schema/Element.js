export default class Element {
  id = `el_${Date.parse(new Date())}_${Math.ceil(Math.random() * 9999)}`;
  x = 0;
  y = 0;
  r = 0;
  lock = false;
  width = 0;
  height = 0;
  tag = "";
  category = "";
  constructor() {}
}
