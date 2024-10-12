<template>
  <div class="tiptap-editor-container">
    <div>
      <button @click="insertResource">插入资源</button>
      <resource-selector ref="resourceSelector"></resource-selector>
    </div>
    <editor-content :editor="editor" class="tiptap-editor-content" />
    <button @click="getJSON">GET JSON</button>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import nkcEmoji from './node/nkcEmoji/nkcEmoji.js'
import nkcSticker from './node/nkcSticker/nkcSticker.js'
import nkcPictureBlock from './node/nkcPictureBlock/nkcPictureBlock.js'
import nkcPictureInline from './node/nkcPictureInline/nkcPictureInline.js'
import nkcPictureFloat from './node/nkcPictureFloat/nkcPictureFloat.js'
import EnsureTrailingParagraph from './plugins/EnsureTrailingProagraph.js'
import nkcVideoBlock from './node/nkcVideoBlock/nkcVideoBlock.js'
import nkcXSFLimit from './node/nkcXSFLimit/nkcXSFLimit.js'
import nkcAudioBlock from './node/nkcAudioBlock/nkcAudioBlock.js'
import ResourceSelector from '../ResourceSelector.vue'
import nkcMath from './node/nkcMath/nkcMath.js'

export default {
  components: {
    EditorContent,
    'resource-selector': ResourceSelector,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      content: `
        <p>I’m running Tiptap with Vue.js. 🎉</p>
        <p>
        AI 应用于公司的日常决策中。AI 代理结合知识库和其他技术，帮助我们理解岗位<nkc-math text="a + b = c" block="false"></nkc-math>背景能力，并辅助从运维到公司内部决策的各个方面。在项目开发和交付过程中，使用 Copilot 等工具辅助开发，以及在测试和运维阶段利用 AI 机器人进行监控和问题处理。AI 在预测和处理问题方面的能力远超传统算法，使我们能够以更低的成本实现更高的效能。
        </p>
        <p>
          啊啊啊啊啊啊啊
          <nkc-emoji unicode="1f602"></nkc-emoji>
          啊啊啊啊啊啊
          <nkc-math text="a + b = c" block="true"></nkc-math>
          公式公式公式公式
          <nkc-sticker id="308179"></nkc-sticker>
          啊啊啊啊啊啊
          <nkc-sticker id="360353"></nkc-sticker>
          啊啊啊啊啊啊
          除了获得该奖项所带来的<nkc-picture-inline id="360355"></nkc-picture-inline>全球声望之外，诺贝尔化学奖还附带 1100 万瑞典克朗（100 万美元）的现金奖励，其中一半将归 David Baker 所有，另一半由 Hassabis 和 Jumper 平分。
          AAAAAAAAAA
        </p>
        <nkc-picture-block id="360354" desc="风景优美"></nkc-picture-block>
        <p>这是末尾的内容</p>
        <nkc-xsf-limit xsf="21" ><p>这是隐藏的内容。。。。。</p></nkc-xsf-limit>

        <nkc-picture-float id="360356" float="right" ></nkc-picture-float>
        <nkc-video-block id="360363" desc="这是视频的介绍"></nkc-video-block>
        <nkc-picture-float id="360356" float="left" ><p>我们先从那些新晋创新者类别的主题开始。检索增强生成（RAG）技术对于那些希望利用大语言模型的能力但又不想将数据发送给大模型厂商的公司来说将变得极为关键。此外，RAG 技术在大规模应用大模型的场景中同样展现出了价值。




在创新者类别中，另一个新晋者是集成了人工智能的硬件，包括支持人工智能的 GPU 基础设施，以及由人工智能技术驱动的个人电脑、智能手机和边缘计算设备。预计在未来 12 个月内，这一领域将迎来显著的增长。




基于大语言模型的解决方案在基础设施部署和管理成本方面面临着挑战。为了应对这些问题，业界正在探索和采纳新的语言模型——小语言模型（SLM）。小语言模型特别适合在资源受限的小型设备上运行，尤其是在边缘计算场景中。一些行业巨头，如微软，已经推出了 Phi-3 等小模型产品，为社区提供了尝鲜的机会，用以比较小模型与大模型在成本和效益方面的差异。</p></nkc-picture-float>
<p>这是末尾的内容</p>
`,

      extensions: [
        StarterKit,
        nkcEmoji,
        nkcSticker,
        nkcPictureBlock,
        nkcPictureInline,
        nkcPictureFloat,
        EnsureTrailingParagraph,
        nkcVideoBlock,
        nkcXSFLimit,
        nkcAudioBlock,
        nkcMath,
      ],
    })
  },

  methods: {
    getJSON() {
      const json = this.editor.getJSON();
      console.log(json);
    },
    insertResource() {
      const self = this;
      this.$refs.resourceSelector.open(data => {
        self.$refs.resourceSelector.close();
        this.editor.commands.focus(); // 确保编辑器获得焦点
        if (data.resources) {
          data = data.resources;
        } else {
          data = [data];
        }
        const insertContent = [];
        for (let i = 0; i < data.length; i++) {
          let source = data[i];
          let type = source.mediaType;
          type = type.substring(5);
          type = type[0].toLowerCase() + type.substring(1);
          console.log('====================================');
          console.log(type, source.rid, source);
          console.log('====================================');
          switch (type) {
            case 'picture': break;
            case 'video': break;
            case 'audio': {
              insertContent.push({
                type: 'nkc-audio-block',
                attrs: {
                  id: source.rid,
                  name: source.oname,
                  size: source.size,
                }
              })
              break;
            }
            case 'attachment': break;
            default: break;
          }
        }
        self.editor.commands.insertContent([...insertContent,{ type: 'paragraph' }]);
      }, {
        fastSelect: true
      });
    },
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style scoped lang="less">
.tiptap-editor-container{
  ::v-deep{
    .nkc-paragraph {
      font-size: 16px;
      line-height: 30px;
    }
  }
}
.tiptap-editor-content {
  ::v-deep {
    .tiptap.ProseMirror {
      padding: 1rem;
      border: 1px solid green !important;
    }
  }
}
</style>
