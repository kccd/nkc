<template lang="pug">
  node-view-wrapper(style="position:relative;")
    div(ref="container")
      pre(style="position:absolute;left: 0;top:0;z-index: 1;width:100%" data-a="123")
        code(:class="'language-' + node.attrs.language" ref="highlightCodeContent" data-b="123")
      pre(
        style="position:relative;z-index: 2;width:100%;caret-color:#000;background-color:transparent;color:transparent;"
        data-c="123"
        ref="codeContent"
        )
        node-view-content(as="code" data-d="123")
</template>

<script>
import { nodeViewProps, NodeViewWrapper, NodeViewContent } from '@tiptap/vue-2';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.min.css';
export default {
  components: {
    'node-view-wrapper': NodeViewWrapper,
    'node-view-content': NodeViewContent,
  },
  props: nodeViewProps,
  mounted() {
    this.editor.on('update', this.highlight);
    setTimeout(() => {
      this.highlight();
    });
  },
  beforeDestroy() {
    this.editor.off('update', this.highlight);
  },
  methods: {
    highlight() {
      const containerDom = this.$refs.container;
      const code = containerDom.querySelectorAll('code');
      if (code.length !== 2) {
        logger.debug(`code dom count: ${code.length}`);
        return;
      }
      const highlightCodeDom = code[0];
      const codeDom = code[1];
      highlightCodeDom.innerHTML =
        hljs.highlight(codeDom.textContent, {
          language: this.node.attrs.language || 'javascript',
        }).value || '<br className="ProseMirror-trailingBreak" />';
    },
  },
};
</script>
