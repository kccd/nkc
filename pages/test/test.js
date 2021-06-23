import Vue from "vue";
// 单文件组件
import CssModule from "./cssmodule.vue";
import ElementUi from "./element-ui.vue";
// JSX Vue组件
import {
  XComponent,
  FunctionalComponent,
  DefineComponent,
  ESLintComponent
} from "./xcomponent";
// 用JSX写Vue单文件组件
import VueXcomponent from "./xcomponent.vue";

new Vue({
  el: "#app",
  data: {},
  components: {
    ElementUi,
    CssModule,
    XComponent,
    FunctionalComponent,
    DefineComponent,
    [ESLintComponent.name]: ESLintComponent,
    VueXcomponent
  }
});