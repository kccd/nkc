<template>
  <node-view-wrapper class="node-view-wrapper">
    <img :src="stickerUrl" alt="stickerUrl">
  </node-view-wrapper>
</template>

<script>
import {NodeViewWrapper, nodeViewProps} from "@tiptap/vue-2";
import {getUrl} from "../../../../js/tools";

export default {
  components: {
    'node-view-wrapper': NodeViewWrapper,
  },
  props: nodeViewProps,
  computed: {
    stickerId() {
      return this.node.attrs.id;
    },
    stickerUrl() {
      return getUrl('sticker', this.stickerId);
    }
  }
}
</script>

<style scoped lang="less">
.node-view-wrapper{
  display: inline-block;
  line-height: 0;
  img{
    min-height: 2rem;
    min-width: 2rem;
    max-height: 5rem;
    max-width: 5rem;
    margin: 0 0.2rem;
    vertical-align: text-bottom;
  }
}
.ProseMirror-selectednode {
  background-color: #2b90d9;
}
</style>