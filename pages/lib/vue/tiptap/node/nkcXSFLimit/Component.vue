<template>
  <node-view-wrapper class="node-view-wrapper">
    <div
      class="nkc-xsf-limit-header"
      @mousedown.stop="noneFunc"
      @focus.stop="noneFunc"
      @mouseup.stop="noneFunc"
      @click.stop="noneFunc"
    >
      浏览这段内容需要
      <input type="text" v-model.number="xsf" @blur.stop="onBlur" />
      <span class="m-r-1">学术分</span>
      <button class="btn btn-danger btn-xs" @click="deleteNode">删除</button>
    </div>
    <node-view-content class="node-view-content" />
  </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewContent, NodeViewWrapper } from '@tiptap/vue-2';
export default {
  components: {
    'node-view-wrapper': NodeViewWrapper,
    'node-view-content': NodeViewContent,
  },
  props: nodeViewProps,
  data: () => ({
    xsf: 1,
  }),
  mounted() {
    this.xsf = this.node.attrs.xsf;
  },
  watch: {
    xsf() {
      this.updateAttributes({
        xsf: this.xsf,
      });
    },
  },
  methods: {
    noneFunc() {},
    onBlur() {
      if (!(this.xsf >= 1)) {
        this.xsf = 1;
      }
    },
  },
};
</script>

<style scoped lang="less">
.node-view-wrapper {
  border: 1px solid #ff6d6d;
  padding: 0.5rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  .nkc-xsf-limit-header {
    background-color: #ff8888;
    color: #fff;
    display: flex;
    height: 3rem;
    justify-content: center;
    align-items: center;
    input {
      width: 5rem;
      margin: 0 0.5rem;
      color: #333;
    }
  }
  .node-view-content {
    display: block;
    border: 1px dashed #ffcccc;
    padding: 0.5rem;
    border-radius: 3px;
  }
}
</style>
