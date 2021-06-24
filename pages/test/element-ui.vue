<template>
  <div>
    <el-button type="primary" @click="print()">{{msg}}</el-button>
    <el-date-picker
      v-model="date"
      type="datetime"
      placeholder="选择日期时间">
    </el-date-picker>
    <p
      :class="{
        title: true, 
        [$style.big]: clicked
      }"
      @click="change()">
      {{clicked? "BIG!!!" : "click me"}}
    </p>
  </div>
</template>

<script>
import { DatePicker, Button } from "element-ui";

export default {
  data: () => ({
    msg: "Hello",
    date: new Date(),
    clicked: false
  }),
  components: {
    [Button.name]: Button,
    [DatePicker.name]: DatePicker
    // 标签名: 组件类
  },
  methods: {
    print() {
      console.log("123")
    },
    change() {
      this.clicked = !this.clicked;
    }
  }
};
</script>

<!-- 一个组件可以有多个style标签 -->
<style src="element-ui/lib/theme-chalk/index.css"></style>

<!-- https://vue-loader.vuejs.org/zh/guide/scoped-css.html -->
<style scoped>
.title {
  color: red;
}
</style>

<!-- https://vue-loader.vuejs.org/zh/guide/css-modules.html -->
<style module>
.big {
  font-size: 2em;
}
</style>