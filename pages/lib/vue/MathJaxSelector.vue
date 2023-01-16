<template lang="pug">
  .math-jax-editor
    .module-header
      .module-title(ref="draggableHandle") 插入公式
      .module-close.fa.fa-close(@click="close")
    .module-body
      .bg-warning.text-warning.p-a-05.m-b-1
        .warning-header 温馨提示
        .warning-content 1. 公式行内显示(inline)：请使用 $....$ 或 \(....\) 包裹代码
        .warning-content 2. 公式独占一行显示(display)：请使用 $$....$$ 或 \[....\] 包裹代码
        .warning-content 3. 插入的公式在编辑时不会渲染，请检查无误后再插入。
      .math-jax-input.m-b-1
        label 请输入公式：
        textarea.form-control(rows="3" v-model="content")
      .math-jax-page
        label 渲染结果：
        iframe.math-jax-view(src="/mathJax" name="mathJaxView" v-if="show")
      .m-t-1.text-right.m-b-05
        button.btn.btn-default.btn-sm(@click="close").m-r-05 取消
        button.btn.btn-primary.btn-sm(v-if="content" @click="insert") 确定
        button.btn.btn-primary.btn-sm(v-else disabled) 确定
</template>
<style lang="less" scoped>
  @import "../../publicModules/base";
  .math-jax-view{
    width: 100%;
    height: 8rem;
    border: 3px dotted #9baec8;
  }
  .math-jax-editor{
    display: none;
    position: fixed;
    width: 46rem;
    max-width: 100%;
    top: 100px;
    right: 0;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
    border: 1px solid #c7c7c7;
    .null{
      margin-top: 5rem;
      margin-bottom: 5rem;
      text-align: center;
    }
    .module-header{
      height: 3rem;
      line-height: 3rem;
      background-color: #f6f6f6;
      position: relative;
      padding-right: 3rem;
      .module-title{
        margin-left: 1rem;
        color: #666;
        cursor: move;
      }
      .module-close{
        height: 3rem;
        width: 3rem;
        position: absolute;
        top: 0;
        right: 0;
        text-align: center;
        line-height: 3rem;
        color: #888;
        cursor: pointer;
        &:hover{
          color: #777;
          background-color: #ddd;
        }
      }
    }
    .module-body{
      padding: 0.5rem 1rem;
    }
  }
</style>
<script>
  import {DraggableElement} from "../js/draggable";
  import {debounce} from '../js/execution';
  export default {
    data: () => ({
      show: false,
      draggableElement: null,
      callback: null,
      content: '',
    }),
    watch: {
      content: debounce(function() {
        this.updateMathJaxView();
      }, 500)
    },
    mounted() {
      this.initDraggableElement();
    },
    destroyed(){
      this.draggableElement && this.draggableElement.destroy();
    },
    methods: {
      initDraggableElement() {
        this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
        this.draggableElement.setPositionCenter();

      },
      updateMathJaxView() {
        const {content} = this;
        mathJaxView.window.renderMathJax(content);
      },
      insert() {
        if(!this.content) return;
        this.callback(this.content);
        this.close();
      },
      open(callback) {
        this.callback = callback;
        this.show = true;
        this.draggableElement.show();
      },
      close() {
        this.show = false;
        this.draggableElement.hide();
      }
    }
  };
</script>
