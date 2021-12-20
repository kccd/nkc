<template lang="pug">
  .module-sr-body
    .module-sr-header(ref="draggableHandle")
      .module-sr-title 学术分隐藏
      .module-sr-close(@click="close")
        .fa.fa-remove
    .module-sr-content
      .container-fluid
        .row
          .form-group
            label 请输入学术分值
              input.form-control(type="number" v-model.number="score" v-on:keyup.enter="insert")
        .row
          .col-xs-5
          button.btn.btn-default.col-xs-3(@click="close") 取消
          button.btn.btn-primary.col-xs-3.insert-hide-content-action(@click="insert") {{init? "修改":"插入"}}
</template>

<style lang="less" scoped>
@import "../../publicModules/base";
.module-sr-body{
  display: none;
  position: fixed;
  width: 252px;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;
  .module-sr-header{
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    .module-sr-close{
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;
      &:hover{
        background-color: rgba(0,0,0,0.08);
        color: #777;
      }
    }
    .module-sr-title{
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
    }
  }
  .module-sr-content{
    padding: 1rem;
    .container-fluid{
      .insert-hide-content-action{
        margin-left: 10px;
      }
    }
  }
}
</style>

<script>
import {DraggableElement} from "../js/draggable";

export default {
  data: () => ({
    draggableElement: null,
    callback: null,
    init: false,
    score: 1,
  }),
  mounted() {
    this.initDraggableElement();
  },
  methods: {
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
    },
    close: function() {
      this.draggableElement.hide();
    },
    open: function(callback, initScore) {
      this.score = 1;
      if(callback && typeof callback === "function") this.callback = callback;
      if(initScore && typeof initScore === "number") {
        this.score = initScore;
        this.init = true;
      } else {
        this.score = 1;
        this.init = false;
      }
      this.draggableElement.show();
    },
    insert: function() {
      const score = parseInt(this.score);
      if(score !== this.score) return sweetWarning("分值必须是整数");
      if(score < 1) return sweetWarning("分值必须大于0");
      if(score > 5) return sweetWarning("分值必须小于5");
      this.callback(score);
      this.close();
    },
  }
}
</script>
