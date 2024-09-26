<template>
  <div class="draggable-dialog-root" v-show="show">
    <draggable-dialog-lg v-if="!isScreenXS" :title="title" :height="height" :width="width" @close="close">
      <slot></slot>
    </draggable-dialog-lg>
    <draggable-dialog-xs v-else :title="title" :height="heightXS" @close="close">
      <slot></slot>
    </draggable-dialog-xs>
  </div>
</template>

<script>
import DraggableDialogXS from './DraggableDialogXS.vue';
import DraggableDialogLG from './DraggableDialogLG.vue';
import {getScreenSizeModel} from '../../js/screen';
import { disableScroll, enableScroll } from "../../js/scrollBar";
export default {
  props: ['title', 'width', 'height', 'heightXS'],
  data: () => ({
    show: false,
    isScreenXS: false,
  }),
  components: {
    'draggable-dialog-lg': DraggableDialogLG,
    'draggable-dialog-xs': DraggableDialogXS,
  },
  methods: {
    initScreenSizeModel() {
      this.isScreenXS = getScreenSizeModel() === 'xs';
    },
    open() {
      this.show = true;
      if(this.isScreenXS) {
        disableScroll();
      }
    },
    close() {
      this.show = false;
      if(this.isScreenXS) {
        enableScroll();
      }
    },
  },
  mounted() {
    this.initScreenSizeModel();
  }
}
</script>

<style lang="less">
  .draggable-dialog-root{
    position: fixed;
    z-index: 10000;
    height: 0;
    width: 0;
    top: 0;
    left: 0;
  }
</style>