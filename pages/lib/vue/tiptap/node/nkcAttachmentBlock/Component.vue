<template>
  <node-view-wrapper class="file-view-wrapper">
    <div class="file-box">
      <span class="file-attachment-icon">
        <img :src="getUrl('fileCover', ext)" alt="attachment icon" />
      </span>
      <span class="file-attachment-content">
        <span class="file-attachment-name" :title="name">{{
          name
        }}</span>
        <span>
          <span class="file-attachment-size">{{
            getSize(size)
          }}</span>
          <span class="file-attachment-ext">{{
            ext.toUpperCase()
          }}</span>
          <!-- <span 
            >{{ hits }}次下载</span
          > -->
          <span
            class="file-attachment-reader"
            v-if="ext === 'pdf'"
          >
            <a
              :href="`/reader/pdf/web/viewer?file=%2fr%2f${
                id
              }?time%3D${Date.now()}`"
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
    name: '',
    size: 0,
    ext: '',
    hits: 0,
  }),
  computed: {
    id() {
      return this.node.attrs.id;
    }
  },
  watch: {
    id() {
      this.getAttachmentInfo();
    }
  },
  mounted() {
    this.getAttachmentInfo();
  },
  methods: {
    getSize,
    getUrl,
    getAttachmentInfo() {
      const self = this;
      if(!this.node.attrs.id) return;
      nkcAPI(`/rs?rid=${this.node.attrs.id}`, 'GET')
        .then(res => {
          const { oname,size,ext}=res.resources[0];
          self.name = oname;
          self.size = size;
          self.ext = ext;
        })
        .catch(console.error);
    }
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
    .file-attachment-icon {
      display: table-cell;
      vertical-align: top;
      width: 3.3rem;
      img {
        width: 3.3rem;
        max-width: none;
        height: 3.3rem;
      }
    }
    .file-attachment-content {
      padding-left: 0.5rem;
      vertical-align: top;
      width: 30rem;
      max-width: 100%;
      display: table-cell;
      .file-attachment-name {
        display: block;
        height: 1.8rem;
        font-size: 1.3rem;
        color: #2b90d9;
        font-weight: 700;
        word-break: break-all;
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        &:hover,
        &:focus {
          color: #2b90d9;
        }
      }
      .file-attachment-size {
        color: #e85a71;
        font-weight: 700;
      }
      .file-attachment-ext {
        color: #e85a71;
        font-weight: 700;
      }
      .file-attachment-reader {
        color: #2b90d9;
        font-weight: 700;
      }
    }
  }
}
.ProseMirror-selectednode {
  .file-box {
    border: 1px solid #00b3ff !important; /* 聚焦时边框颜色 */
  }
}
</style>