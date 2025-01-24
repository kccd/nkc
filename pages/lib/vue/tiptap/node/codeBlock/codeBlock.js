import { VueNodeViewRenderer } from '@tiptap/vue-2';
import CodeBlock from '@tiptap/extension-code-block';
import Component from './Component.vue';
const nodeName = 'codeBlock';

export default CodeBlock.extend({
  name: nodeName,
  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
});
