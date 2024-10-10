import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';

import Component from './Component.vue';

export default Node.create({
  name: 'nkc-picture-float',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      id: '',
      float: '', // left or right
    };
  },

  parseHTML() {
    return [
      {
        tag: 'nkc-picture-float',
      },
    ];
  },

  renderHTML(props) {
    const { HTMLAttributes } = props;
    return ['nkc-picture-float', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
});
