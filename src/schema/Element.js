export default class Element {
  /* 唯一标志符 */
  id = `el_${Date.parse(new Date())}_${Math.ceil(Math.random() * 9999)}`;
  /* x 坐标 */
  x = 0;
  /* y 坐标 */
  y = 0;
  /* 旋转 */
  r = 0;
  /* 锁定 */
  lock = false;
  constructor() {}
}
