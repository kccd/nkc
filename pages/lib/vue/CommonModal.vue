<template lang="pug">
  .module-dialog-body
    .module-dialog-header(ref="draggableHandle")
      .module-dialog-title {{title}}
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      .form
        .form-group(v-for="(d, index) in data")
          h5(v-if="d.label") {{d.label}}
          //- 数字input
          input.form-control(v-if="d.dom === 'input' && d.type === 'number' && d.type !== 'file'" :type="d.type || 'text'" v-model.number="d.value" :placeholder="d.placeholder || ''" @keyup.enter="submit" )
          //- 非数字input
          input.form-control(v-if="d.dom === 'input' && d.type !== 'number' && d.type !== 'file'" :type="d.type || 'text'" v-model="d.value" :maxlength="d.max" :placeholder="d.placeholder || ''" @keyup.enter="submit" )
          //- 文件input
          input.form-control(v-if="d.dom === 'input' && d.type === 'file'" type="file" @change="pickedFile(index)" @keyup.enter="submit" :ref="'input' + index" :accept="d.accept")
          //- 文本框
          textarea.form-control(v-if="d.dom === 'textarea'" v-model="d.value" :placeholder="d.placeholder || ''" :rows="d.rows || 4" @keyup.enter="!d.disabledKeyup?submit:';'" )
          //- 单选
          .radio(v-if="d.dom === 'radio'")
            label.m-r-05(v-for="r in d.radios")
              input(type="radio" :value="r.value" v-model="d.value")
              span {{r.name}}
          //- 多选
          .checkbox(v-if="d.dom === 'checkbox'")
            label.m-r-05(v-for="r in d.checkboxes")
              input(type="checkbox" :value="r._id" name="checkboxes" v-model="d.value")
              span {{r.name}}
      .m-t-1.m-b-1.text-right
        button.btn.btn-sm.btn-default.m-r-05(@click="close") 关闭
        button.btn.btn-sm.btn-primary(@click="submit") 确定
</template>

<style lang="less" scoped>
@import "../../publicModules/base";
.module-dialog-body{
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
  .module-dialog-header{
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    .module-dialog-close{
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
    .module-dialog-title{
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
    }
  }
  .module-dialog-content{
    padding: 0 1rem;
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
    show: false,
    title: "",
    info: "",
    quote: "",
    data: {}
  }),
  mounted() {
    this.initDraggableElement();
  },
  destroyed(){
    this.draggableElement && this.draggableElement.destroy();
  },
  methods: {
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
      this.draggableElement.setPositionCenter()

    },
    submit: function() {
      this.callback(this.data);
    },
    pickedFile: function(index) {
      var dom = this.$refs['input'+index][0];
      this.data[index].value = dom.files[0];
    },
    open(callback, options) {
      this.callback = callback;
      this.data = options.data;
      this.quote = options.quote;
      this.title = options.title;
      this.info = options.info || "";
      this.draggableElement.show();
      this.show = true;
    },
    close() {
      this.draggableElement.hide();
      this.show = false;
      setTimeout(function() {
        this.data = {};
      }, 500);
    },
  }
}
</script>
