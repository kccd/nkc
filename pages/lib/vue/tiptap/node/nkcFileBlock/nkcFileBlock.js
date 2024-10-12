import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';

import Component from './Component.vue';

export default Node.create({
  name: 'nkc-file-block',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      id: '',
      name: '',
      size: 0,
    };
  },

  parseHTML() {
    return [
      {
        tag: 'nkc-file-block',
      },
    ];
  },

  renderHTML(props) {
    const { HTMLAttributes } = props;
    return ['nkc-file-block', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
});
