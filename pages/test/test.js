/**
 * 本项目中的一些工程实践，供开发时参考
 */
import Vue from "vue";
// 单文件组件  (vue-loader提供)
import ElementUi from "./element-ui.vue";
// JSX Vue组件(5种声明方式)  (babel-loader + vue eslint规则提供)
import {
  XComponent,
  FunctionalComponent,
  DefineComponent,
  ESLintComponent
} from "./xcomponent";
import VueXcomponent from "./xcomponent.vue";
// 模块化css  (css-loader提供)
import style from "./test.module.less";
// 宏脚本(编译时执行)  (babel-plugin-preval插件提供)
import bundle from /* preval */ "./lib/bundle.preval.js";


console.log("模块化CSS:", style);
console.log("宏脚本导出:", bundle);

new Vue({
  components: {
    ElementUi,
    XComponent,
    FunctionalComponent,
    DefineComponent,
    [ESLintComponent.name]: ESLintComponent,
    VueXcomponent
  }
}).$mount("#app");