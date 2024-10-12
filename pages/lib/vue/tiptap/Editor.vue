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
        <p> 常规文字：八百标兵奔北坡，标兵并排北边跑。</p>
        <p>自定义表情节点：<nkc-emoji unicode="1f602"</nkc-emoji></p>
        <p>图片</p>
        <nkc-picture-float id="352188" float="right" ></nkc-picture-float>
         <p>音频</p>
        <nkc-audio-block id="352208" name="魂斗罗" size=""></nkc-audio-block>
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
.tiptap-editor-container {
  ::v-deep {
    p {
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
