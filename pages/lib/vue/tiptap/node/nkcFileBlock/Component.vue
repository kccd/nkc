<template>
  <node-view-wrapper class="audio-view-wrapper">
    <div class="file-box"></div>
  </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-2";
import { nkcAPI } from "../../../../js/netAPI";
export default {
  props: nodeViewProps,
  components: {
    'node-view-wrapper': NodeViewWrapper,
  },
  data: () => ({
  }),
  computed: {
  },
  watch: {
  },
  mounted() {
    console.log(this.node.attrs);
  },
  methods: {
  },
}
</script>

<style scoped lang="less">
.audio-view-wrapper {
  padding: 1rem 0;
  text-align: center;
}
.ProseMirror-selectednode {
  .file-box {
    border: 1px solid #00b3ff !important; /* 聚焦时边框颜色 */
  }
}
</style>