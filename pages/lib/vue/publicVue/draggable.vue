<template lang="pug">
  .module-dialog-body(ref="draggableBox")
    .module-dialog-header
      .module-dialog-title(ref="draggableHandle") {{title}}
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      slot(name="content")

</template>
<style lang="less" scoped>
@import "../../../publicModules/base";
.module-dialog-body{
  display: none;
  position: fixed;
  width: 56rem;
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
    padding-right: 3rem;
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
    //padding: 0 1rem;
  }
}
</style>
<script>
import {DraggableElement} from "../../js/draggable";
import {debounce} from "../../js/execution";
import {getScrollBarWidth, hasScrollBar} from "../../js/scrollBar";

export default {
  props: {
    title:{
      type: String || Number,
      default: ''
    }
  },
  data: ()=>{
    return {
      mouseOver: false,
    }
  },
  mounted() {
    this.initDraggableElement();
  },
  destroyed(){
    this.draggableElement && this.draggableElement.destroy();
  },
  methods: {
    initContainerMouseEvent() {
      const app = this;
      const containerElement = $(this.$refs.draggableBox);
      containerElement.on('mouseleave', () => {
        app.onMouseLeave();
      });
      containerElement.on('mouseover', () => {
        app.onMouseOver();
      });
    },
    // 离开弹窗，取消禁止滚动
    enableScroll: debounce(function() {
      $('body').css({
        'overflow': '',
        'padding-right': ''
      });
    }, 200),
    // 禁止body滚动
    disableScroll: debounce(function() {
      const body = $('body');
      const cssObj = {
        overflow: 'hidden'
      };
      if(hasScrollBar()) {
        const scrollBarWidth = getScrollBarWidth();
        cssObj['padding-right'] = scrollBarWidth + 'px';
      }
      body.css(cssObj);
    }, 200),
    // 鼠标离开面板
    onMouseLeave() {
      if(!this.mouseOver) return;
      this.mouseOver = false;
      this.enableScroll();
    },
    // 鼠标悬浮于面板之上
    onMouseOver() {
      if(this.mouseOver) return;
      this.mouseOver = true;
      this.disableScroll();
    },
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
      this.draggableElement.setPositionCenter();
      this.initContainerMouseEvent()
    },
    open(callback, options) {
      const self = this;
      self.draggableElement.show();
    },
    close() {
      this.draggableElement.hide();
    },
  }
}
</script>
