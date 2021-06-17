<template>
  <div>
    <el-button type="primary">{{msg}}</el-button>
    <el-date-picker
      v-model="date"
      type="datetime"
      placeholder="选择日期时间">
    </el-date-picker>
  </div>
</template>

<script>
import Button from "element-ui/lib/button";
import { DatePicker } from "element-ui";

export default {
  data: () => ({
    msg: "Hello",
    date: new Date()
  }),
  components: {
    [Button.name]: Button,
    [DatePicker.name]: DatePicker
  }
};
</script>

<style scoped lang="less">
  @import "element-ui/lib/theme-chalk/index.css";
</style>
