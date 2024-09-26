<template>
  <div class="draggable-dialog-xs-root">
    <div class="draggable-dialog-xs-mask" @click="toClose" />
    <div class="draggable-dialog-xs-container" :style="containerStyle">
      <div class="draggable-dialog-xs-title-container">
        <div class="draggable-dialog-xs-title">{{title}}</div>
        <div class="draggable-dialog-xs-option" @click="toClose">
          <close theme="filled" size="18" fill="#555"/>
        </div>
      </div>
      <div class="draggable-dialog-xs-body-container">
        <slot></slot>
      </div>
    </div>
  </div>

</template>

<script>
  import { Close as close } from "@icon-park/vue";

  export default {
    components: { close },
    props: ['title', 'height'],
    data: () => ({
      a: 1,
    }),
    computed: {
      containerStyle() {
        return `height:${this.height};`;
      }
    },
    methods: {
      toClose() {
        this.$emit('close');
      }
    }
  }
</script>


<style scoped>
.draggable-dialog-xs-root{
  position: fixed;
}
.draggable-dialog-xs-mask{
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
.draggable-dialog-xs-container {
  display: flex;
  position: fixed;
  flex-direction: column;
  width: 100%;
  left: 0;
  bottom: 0;
  z-index: 1001;
}

.draggable-dialog-xs-title-container{
  height: 4rem;
  width: 100%;
  display: flex;
  background-color: #f4f4f4;
  flex-shrink: 0;
  .draggable-dialog-xs-title{
    cursor: move;
    flex: 1;
    display: flex;
    align-items: center;
    padding-left: 1rem;
  }
  .draggable-dialog-xs-option{
    cursor: pointer;
    width: 4rem;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 0.2rem;
    &:active {
      background-color: #eee;
    }
  }
}
.draggable-dialog-xs-body-container{
  flex: 1;
  overflow: hidden;
}
</style>