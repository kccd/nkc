<template>
  <node-view-wrapper class="file-view-wrapper">
    <div class="file-box">
      <span class="article-attachment-icon">
        <img :src="getUrl('fileCover', node.attrs.ext)" alt="attachment icon" />
      </span>
      <span class="article-attachment-content">
        <span class="article-attachment-name" :title="node.attrs.name">{{
          node.attrs.name
        }}</span>
        <span class="article-attachment-info">
          <span class="article-attachment-size">{{
            getSize(node.attrs.size)
          }}</span>
          <span class="article-attachment-ext">{{
            node.attrs.ext.toUpperCase()
          }}</span>
          <span class="article-attachment-hits"
            >{{ node.attrs.hits }}次下载</span
          >
          <span
            class="article-attachment-reader"
            v-if="node.attrs.ext === 'pdf'"
          >
            <a
              :href="`/reader/pdf/web/viewer?file=%2fr%2f${node.attrs.id}?time%3D${Date.now()}`"
              target="_blank"
              >预览</a
            >
            <span
              class="fa fa-question-circle"
              title="预览文件已被压缩处理，并不代表真实文件质量"
            ></span>
          </span>
        </span>
      </span>
    </div>
  </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-2";
import { nkcAPI } from "../../../../js/netAPI";
import { getSize, getUrl } from "../../../../js/tools";
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
  },
  methods: {
    getSize,
    getUrl,
  },
}
</script>

<style scoped lang="less">
.file-view-wrapper {
  padding: 1rem 0;
  text-align: center;
  .file-box {
    position: relative;
    padding: 0.5rem;
    box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.14);
    border-radius: 2px;
    border: 1px solid #d6d6d6;
    background: #fff;
    max-width: 100%;
  }
}
.ProseMirror-selectednode {
  .file-box {
    border: 1px solid #00b3ff !important; /* 聚焦时边框颜色 */
  }
}
</style>