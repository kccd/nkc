<template lang="pug">
  .module-dialog-body
    .module-dialog-header(ref="draggableHandle")
      .module-dialog-title 评为精选
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      .modal-body(v-if="digestData")
        span {{`奖励${digestData.digestRewardScore.name}(${digestData.digestRewardScore.unit})，范围 ${digestData.redEnvelopeSettings.draftFee.minCount/100} 到 ${digestData.redEnvelopeSettings.draftFee.maxCount/100}`}}
        input(v-model.number="digestCount" type='number' name='digestKcb')
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
    digestData: null,
    digestCount: null,
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
      this.callback(this.digestCount * 100);
    },
    close() {
      this.draggableElement.hide();
      this.show = false;
    },
    open(callback, options) {
      const {digestData} = options;
      this.callback = callback;
      this.digestCount = digestData.redEnvelopeSettings.draftFee.defaultCount/100;
      this.digestData = digestData;
      this.draggableElement.show();
      this.show = true;
    },
  }
}
</script>
