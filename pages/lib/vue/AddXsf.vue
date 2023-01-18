<template lang="pug">
  .module-dialog-body
    .module-dialog-header
      .module-dialog-title(ref="draggableHandle") 评为精选
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      .modal-body
        .from
          .form-group
            label 分值（-5 到 1）
            input.form-control(v-model.number="num" type='number' name='xsf')
          .form-group
            label 原因（不超过500个字）
            textarea.form-control(rows=5 placeholder="请输入原因..." v-model="description" name="description")
      .m-t-1.m-b-1.text-right
        button.btn.btn-sm.btn-default.m-r-05(@click="close") 关闭
        button.btn.btn-sm.btn-primary(@click="submit") 确定
</template>
<style lang="less" scoped>
@import '../../publicModules/base';
.module-dialog-body {
  display: none;
  position: fixed;
  width: 30rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;

  .module-dialog-header {
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    padding-right: 3rem;
    .module-dialog-close {
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;

      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
        color: #777;
      }
    }

    .module-dialog-title {
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
    }
  }

  .module-dialog-content {
    padding: 0 1rem;
  }
}
</style>
<script>
import {DraggableElement} from "../js/draggable";
export default {
  data: () => ({
    show: false,
    num: null,
    description: null,
  }),
  mounted() {
    this.initDraggableElement()
  },
  destroyed() {
    this.draggableElement && this.draggableElement.destroy();
  },
  methods: {
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
      this.draggableElement.setPositionCenter()
    },
    submit: function() {
      this.callback({
        num: this.num,
        description: this.description,
      });
    },
    close() {
      this.draggableElement.hide();
      this.show = false;
      this.num = null;
      this.description = null;
    },
    open(callback, options) {
      const {} = options;
      this.callback = callback;
      this.draggableElement.show();
      this.show = true;
    },
  }
}
</script>
