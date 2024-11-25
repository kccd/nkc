<template>
  <node-view-wrapper class="node-view-wrapper">
    <img :src="emojiUrl" :alt="unicode">
  </node-view-wrapper>

</template>

<script>
import {nodeViewProps, NodeViewWrapper} from "@tiptap/vue-2";
import {getUrl} from "../../../../js/tools";

export default {
  components: {
    'node-view-wrapper': NodeViewWrapper,
  },
  props: nodeViewProps,
  computed: {
    unicode() {
      return this.node.attrs.unicode
    },
    emojiUrl() {
      return getUrl('emoji', this.unicode);
    }
  },
}
</script>

<style scoped lang="less">
.node-view-wrapper{
  display: inline-block;
  height: 2rem;
  width: 2rem;
  line-height: 0;
  img{
    height: 100%;
    width: 100%;
    vertical-align: text-bottom;
  }
}
.ProseMirror-selectednode {
  background-color: #2b90d9;
}
</style>