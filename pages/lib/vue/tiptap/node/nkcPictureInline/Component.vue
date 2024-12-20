<template>
  <node-view-wrapper class="node-view-wrapper">
    <img :src="pictureUrl" :alt="rid" />
  </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-2';
import { getUrl } from '../../../../js/tools';
export default {
  components: {
    'node-view-wrapper': NodeViewWrapper,
  },
  props: nodeViewProps,
  computed: {
    rid() {
      return this.node.attrs.id;
    },
    pictureUrl() {
      return getUrl('resource', this.rid);
    },
  },
};
</script>

<style scoped lang="less">
.node-view-wrapper {
  display: inline-block;
  margin-bottom: 0.5rem;
  vertical-align: text-bottom;
  img {
    max-width: 100%;
    border-radius: 5px;
  }
}
.ProseMirror-selectednode {
  outline: 2px solid #66afe9;
}
</style>
