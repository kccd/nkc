import Vue from "vue";
import Cssmodule from "./cssmodule.vue";
import ui from "./element-ui.vue";
import { sayHello } from "./lib/util";

sayHello();

new Vue({
  el: "#app",
  data: {

  },
  components: {
    ui: ui,
    cssmodule: Cssmodule
  }
});