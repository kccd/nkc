<template>
  <node-view-wrapper class="node-view-wrapper">
    <img :src="pictureUrl" :alt="rid">
    <textarea rows="2" v-model="node.attrs.desc" class="form-control" placeholder="一句话介绍"></textarea>
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
    desc() {
      return this.node.attrs.desc;
    },
    rid() {
      return this.node.attrs.id;
    },
    pictureUrl() {
      return getUrl('resource', this.rid);
    }
  },
}
</script>

<style scoped lang="less">
.node-view-wrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  img{
    max-width: 100%;
    border-radius: 5px;
  }
  textarea {
    margin-top: 1rem;
    width: 30rem;
    max-width: 100%;
  }
}
.ProseMirror-selectednode {
  outline: 3px solid #66afe9;
}
</style>