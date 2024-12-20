<template>
  <node-view-wrapper class="audio-view-wrapper">
    <!-- <audio :src="`/r/${node.attrs.id}`" controls></audio> -->
    <div class="audio-box">
      <audio ref="audioDom" class="plyr-dom" preload="none" controls>
        <source :src="`/r/${node.attrs.id}`" type="audio/mp3" />
        你的浏览器不支持audio标签，请升级。
      </audio>
      <span class="audio-title"
        >{{ node.attrs.name }}
        <span class="display-i-b text-danger" style="font-weight: 700">{{
          getSize(node.attrs.size)
        }}</span></span
      >
    </div>
  </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-2';
import { nkcAPI } from '../../../../js/netAPI';

import '../../../../../../public/external_pkgs/plyr/plyr.css';
import '../../../../../../public/external_pkgs/plyr/plyr.polyfilled.min.js';
import Plyr from '../../../../../../public/external_pkgs/plyr/plyr.min.js';
import { getSize } from '../../../../js/tools';
export default {
  props: nodeViewProps,
  components: {
    'node-view-wrapper': NodeViewWrapper,
  },
  data: () => ({
    player: null,
    isFocused: false,
  }),
  computed: {},
  watch: {},
  mounted() {
    this.player = new Plyr(this.$refs.audioDom, {
      ratio: '4:3',
      title: this.node.attrs.name,
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'captions',
        'pip',
        'airplay',
        'fullscreen',
      ],
      settings: ['quality'],
      quality: { default: 480, options: [1080, 720, 480] },
      blankVideo: '/external_pkgs/plyr/blank.mp4',
      autopause: true,
    });
  },
  methods: {
    getSize,
  },
};
</script>

<style scoped lang="less">
.audio-view-wrapper {
  padding: 0;
  margin-bottom: 0.5rem;
  text-align: center;
  max-width: 414px;
  .audio-box {
    box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.14);
    border-radius: 2px;
    border: 1px solid #d6d6d6;
    background: #fff;
    max-width: 414px;
    .audio-title {
      display: block;
      color: #000;
      font-size: 1.2rem;
      margin: 0 auto;
      text-align: center;
      margin-bottom: 0.3rem;
      span {
        margin-right: 0.5rem;
      }
      a {
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}
.ProseMirror-selectednode {
  .audio-box {
    border: 1px solid #66afe9 !important; /* 聚焦时边框颜色 */
  }
}
</style>
