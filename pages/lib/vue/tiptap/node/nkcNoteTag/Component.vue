<template>
  <node-view-wrapper class="node-view-wrapper">
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
  background-color: aqua;
}
</style>