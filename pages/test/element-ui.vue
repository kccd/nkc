<template>
  <div>
    <el-button type="primary" @click="print()">{{msg}}</el-button>
    <el-date-picker
      v-model="date"
      type="datetime"
      placeholder="选择日期时间">
    </el-date-picker>
  </div>
</template>

<script>
import { DatePicker, Button } from "element-ui";

export default {
  data: () => ({
    msg: "Hello",
    date: new Date()
  }),
  components: {
    [Button.name]: Button,
    [DatePicker.name]: DatePicker
  },
  methods: {
    print() {
      console.log("123")
    }
  }
};
</script>

<style src="element-ui/lib/theme-chalk/index.css"></style>
