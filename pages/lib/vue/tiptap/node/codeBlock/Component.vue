<template lang="pug">
  node-view-wrapper(:class="$style.wrapper")
    div(:class="$style.headerContainer" contenteditable="false")
      select.m-r-05(@mousedown.stop @focus.stop @click.stop v-model="language")
        option(v-for="item in highlightLanguages" :value="item.type" :key="item.type") {{ item.name }}
      button.btn.btn-danger.btn-xs(@mousedown="deleteCodeBlock") 删除代码块
    div(ref="container" style="position:relative;")
      pre(style="position:absolute;left: 0;top:0;z-index: 1;width:100%")
        code(:class="'language-' + node.attrs.language" ref="highlightCodeContent")
      pre(
        style="position:relative;z-index: 2;width:100%;caret-color:#000;background-color:transparent;color:transparent;"
        ref="codeContent"
        )
        node-view-content(as="code")
</template>

<script>
import { nodeViewProps, NodeViewWrapper, NodeViewContent } from '@tiptap/vue-2';
import hljs, { fixLanguage, highlightLanguages } from '../../../../js/highlight';
export default {
  components: {
    'node-view-wrapper': NodeViewWrapper,
    'node-view-content': NodeViewContent,
  },
  data: () => ({
    highlightLanguages: highlightLanguages,
    language: '',
  }),
  props: nodeViewProps,
  mounted() {
    this.language = this.node.attrs.language;
    setTimeout(() => {
      this.highlight();
    });
  },
  watch: {
    node() {
      this.highlight();
    },
    language: function () {
      this.highlight();
      this.updateAttributes({
        language: this.language,
      });
    },
  },
  methods: {
    highlight() {
      const containerDom = this.$refs.container;
      const code = containerDom.querySelectorAll('code');
      if (code.length !== 2) {
        return;
      }
      const highlightCodeDom = code[0];
      const codeDom = code[1];
      setTimeout(() => {
        const lang = fixLanguage(this.language);
        if (lang === 'other') {
          highlightCodeDom.innerHTML =
            hljs.highlightAuto(codeDom.textContent).value ||
            '<br className="ProseMirror-trailingBreak" />';
        } else {
          highlightCodeDom.innerHTML =
            hljs.highlight(codeDom.textContent, {
              language: lang,
            }).value || '<br className="ProseMirror-trailingBreak" />';
        }
      });
    },
    deleteCodeBlock(e) {
      e.preventDefault();
      this.deleteNode();
    },
  },
};
</script>

<style module scoped lang="less">
pre {
  padding: 0.5rem;
  margin: 0;
  background-color: transparent;
  border: none;
}
.wrapper {
  border: 1px solid #d7d7d7;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}
.headerContainer {
  user-select: none;
  background-color: #f4f4f4;
  padding: 0.3rem;
  border-bottom: 1px solid #dbdbdb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  select {
    font-size: 1.2rem;
    outline: none;
    border-color: #c7c7c7;
  }
}
</style>
