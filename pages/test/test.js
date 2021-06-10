import Vue from "vue";
import Cssmodule from "./cssmodule.vue";
import { sayHello } from "./lib/util";

sayHello();

Vue.component("cssmodule", Cssmodule);

new Vue({
  el: "#app",
  data: {

  }
});