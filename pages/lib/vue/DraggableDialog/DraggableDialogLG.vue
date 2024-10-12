<template>
  <div class="draggable-dialog-root">
    <div class="draggable-dialog-container" ref="draggableBox" :style="containerStyle">
      <div class="draggable-dialog-title-container">
        <div class="draggable-dialog-title" ref="draggableHandle">{{title}}</div>
        <div class="draggable-dialog-option" @click="toClose">
          <close theme="filled" size="18" fill="#555"/>
        </div>
      </div>
      <div class="draggable-dialog-body-container">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { Close as close } from "@icon-park/vue";
import { DraggableElement } from "../../js/draggable";
import { disableScroll, enableScroll } from "../../js/scrollBar";

export default {
  components: { close },
  props: ['title', 'width', 'height'],
  data: () => ({
    a: 1,
  }),
  computed: {
    containerStyle() {
      return `width: ${this.width}; height: ${this.height};`;
    }
  },
  methods: {
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$refs.draggableBox, this.$refs.draggableHandle);
      this.draggableElement.setPositionCenter();
    },
    toClose() {
      this.$emit('close');
    },
    enableScroll: enableScroll,
    // 禁止body滚动
    disableScroll: disableScroll,
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
  },
  mounted() {
    this.initDraggableElement();
    this.initContainerMouseEvent();
  },
  destroyed() {
    this.draggableElement && this.draggableElement.destroy();
  }
}
</script>

<style scoped lang='less'>
.draggable-dialog-root{
  top: 0;
  left: 0;
  position: fixed;
  z-index: 1000;
}
.draggable-dialog-container{
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 3px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .draggable-dialog-title-container{
    user-select: none;
    line-height: initial;
    height: 3rem;
    width: 100%;
    display: flex;
    background-color: #f4f4f4;
    .draggable-dialog-title{
      font-size: 1.2rem;
      cursor: move;
      flex: 1;
      display: flex;
      align-items: center;
      padding-left: 1rem;
    }
    .draggable-dialog-option{
      cursor: pointer;
      width: 3rem;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 0.2rem;
      &:hover{
        background-color: #eee;
      }
    }
  }
  .draggable-dialog-body-container{
    flex: 1;
    overflow: hidden;
  }
}
</style>