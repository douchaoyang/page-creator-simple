import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { Input, Button } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.prototype.$ELEMENT = { size: "mini" };

Vue.use(Input);
Vue.use(Button);

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
