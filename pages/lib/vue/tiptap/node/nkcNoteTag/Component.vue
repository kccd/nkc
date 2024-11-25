<template>
  <node-view-wrapper class="node-view-wrapper">
    <!-- <span v-if="node.attrs.start">{{ `[${node.attrs.id}` }}</span>
    <span v-if="node.attrs.end">{{ `${node.attrs.id}]` }}</span> -->
  </node-view-wrapper>
</template>

<script>
import {nodeViewProps, NodeViewWrapper} from "@tiptap/vue-2";
export default {
  components: {
    'node-view-wrapper': NodeViewWrapper,
  },
  props: nodeViewProps,
  mounted(){
  },
  computed: {
  },
}
</script>

<style scoped lang="less">
.node-view-wrapper{
  display: inline;
  color:  aqua;
}
</style>