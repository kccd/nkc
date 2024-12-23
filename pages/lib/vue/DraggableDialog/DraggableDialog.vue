<template>
  <draggable-dialog-lg
    v-if="!isScreenXS"
    :title="title"
    :height="height"
    :width="width"
    @close="close"
    v-show="show"
  >
    <slot></slot>
  </draggable-dialog-lg>
  <draggable-dialog-xs
    v-else
    :title="title"
    :height="heightXS"
    @close="close"
    v-show="show"
  >
    <slot></slot>
  </draggable-dialog-xs>
</template>

<script>
import DraggableDialogXS from './DraggableDialogXS.vue';
import DraggableDialogLG from './DraggableDialogLG.vue';
import { getScreenSizeModel } from '../../js/screen';
import { disableScroll, enableScroll } from '../../js/scrollBar';
import { getState } from '../../js/state';
import { RNDisableRefresher, RNEnableRefresher } from '../../js/reactNative';
const { isApp } = getState();

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
      if (this.isScreenXS) {
        disableScroll();
      }
      if (isApp) {
        RNDisableRefresher();
      }
    },
    close() {
      this.show = false;
      if (this.isScreenXS) {
        enableScroll();
      }
      if (isApp) {
        RNEnableRefresher();
      }
    },
  },
  mounted() {
    this.initScreenSizeModel();
  },
};
</script>
