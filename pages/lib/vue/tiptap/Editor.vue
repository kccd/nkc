<template>
  <div class="tiptap-editor-container">
    <editor-content :editor="editor" />
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



export default {
  components: {
    EditorContent,
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
          啊啊啊啊啊啊啊
          <nkc-emoji unicode="1f602"></nkc-emoji>
          啊啊啊啊啊啊
          <nkc-sticker id="308179"></nkc-sticker>
          啊啊啊啊啊啊
          <nkc-sticker id="360353"></nkc-sticker>
          啊啊啊啊啊啊
          除了获得该奖项所带来的<nkc-picture-inline id="360355"></nkc-picture-inline>全球声望之外，诺贝尔化学奖还附带 1100 万瑞典克朗（100 万美元）的现金奖励，其中一半将归 David Baker 所有，另一半由 Hassabis 和 Jumper 平分。
          AAAAAAAAAA
        </p>
        <nkc-picture-block id="360354" desc="风景优美"></nkc-picture-block>
        <p>这是末尾的内容</p>
        <nkc-picture-float id="360356" float="left" ><p>234234</p></nkc-picture-float>

`,

      extensions: [StarterKit, nkcEmoji, nkcSticker, nkcPictureBlock, nkcPictureInline, nkcPictureFloat],
    })
  },

  methods: {
    getJSON() {
      const json = this.editor.getJSON();
      console.log(json);
    }
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style scoped lang="less">
.tiptap-editor-container{
  ::v-deep{
    p {
      font-size: 15px;
    }
  }
}
</style>
