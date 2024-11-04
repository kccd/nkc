<template>
  <node-view-wrapper class="node-view-wrapper">
    <video-player :file="videoInfo" class="video-player" />
    <!-- <textarea rows="2" v-model="node.attrs.desc" class="form-control" placeholder="一句话介绍"></textarea> -->
  </node-view-wrapper>
</template>

<script>
import {nodeViewProps, NodeViewContent, NodeViewWrapper} from "@tiptap/vue-2";
import VideoPlayer from '../../../VideoPlayer.vue'
import {nkcAPI} from "../../../../js/netAPI";

export default {
  props: nodeViewProps,
  components: {
    'node-view-wrapper': NodeViewWrapper,
    'node-view-content': NodeViewContent,
    'video-player': VideoPlayer,
  },
  data: () => ({
    videoInfo: null,
  }),
  computed: {
    id() {
      return this.node.attrs.id;
    }
  },
  mounted() {
    this.getVideoInfo();
  },
  methods: {
    getVideoInfo() {
      if(!this.id) return;
      nkcAPI(`/r/${this.id}/info`, 'GET')
        .then(res => {
          this.videoInfo = res.videoPlayerData;
        })
        .catch(console.error);
    }
  },
  watch: {
    id() {
      this.getVideoInfo();
    }
  }
}
</script>

<style scoped lang="less">
.node-view-wrapper{
  padding: 1rem 0;
  .video-player{
    border-radius: 5px;
    overflow: hidden;
  }
  textarea {
    width: 30rem;
    max-width: 100%;
    margin: 1rem auto auto auto;
  }
}
.ProseMirror-selectednode {
  outline: 3px solid #66afe9;
}
</style>