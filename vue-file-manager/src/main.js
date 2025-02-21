import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import App from "./App.vue";

import "./assets/main.css";

import ElFlex from "./components/ElFlex.vue";
import ElSpace from "./components/ElSpace.vue";

Vue.use(ElementUI);

Vue.component("ElFlex", ElFlex);
Vue.component("ElSpace", ElSpace);

new Vue({
  render: (h) => h(App),
}).$mount("#app");
