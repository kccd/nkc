import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import Component from './Component.vue';
const nodeName = 'nkc-xsf-limit';

export default Node.create({
  name: nodeName,
  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      xsf: '',
    };
  },

  parseHTML() {
    return [
      {
        tag: nodeName,
      },
    ];
  },

  renderHTML(props) {
    const { HTMLAttributes } = props;
    return [nodeName, mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
});
