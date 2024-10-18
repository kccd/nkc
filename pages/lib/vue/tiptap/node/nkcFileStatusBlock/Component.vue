<template>
  <node-view-wrapper class="file-status-view-wrapper">
    <div class="file-status-box">
      <span class="info"> 图片{{ info }}</span>
      <span class="dot-animation" v-if="process !== 1">
        <span
          v-for="(dot, index) in 3"
          :key="index"
          :style="{ opacity: currentDot === index ? 0.5 : 1 }"
          >.</span
        >
      </span>
    </div>
  </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-2";
export default {
  props: nodeViewProps,
  components: {
    'node-view-wrapper': NodeViewWrapper,
  },
  data: () => ({
    currentDot: 0, // 当前显示的点
    interval: null,
  }),
  computed: {
    process() {
      return Number(this.node.attrs.process || 0);
    },
    info() {
      return this.node.attrs.info;
    }
  },
  mounted() {
    this.startAnimation();
  },
  beforeDestroy() {
    this.stopAnimation();
  },
  methods: {
    startAnimation() {
      this.interval = setInterval(() => {
        this.currentDot = (this.currentDot + 1) % 3; // 循环在 0 到 2 之间
      }, 500); // 每 500ms 更新
    },
    stopAnimation() {
      clearInterval(this.interval);
    },
  },
}
</script>

<style scoped lang="less">
.file-status-view-wrapper {
  padding: 1rem 0;
  text-align: center;
  .file-status-box {
    border: 1px solid transparent;
    width: 100%;
    background-color: #f0f0f0; /* 灰色背景 */
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    .info {
      font-size: 1.4rem;
      color: #555;
      text-align: right;
    }
    .dot-animation {
      text-align: left;
      font-size: 2rem;
    }
  }
}
.ProseMirror-selectednode {
  .file-status-box {
    border: 1px solid #66afe9 !important; /* 聚焦时边框颜色 */
  }
}
</style>