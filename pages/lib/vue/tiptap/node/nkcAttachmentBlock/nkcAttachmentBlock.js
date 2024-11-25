import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';

import Component from './Component.vue';

export default Node.create({
  name: 'nkc-attachment-block',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      id: '',
    };
  },

  parseHTML() {
    return [
      {
        tag: 'nkc-attachment-block',
      },
    ];
  },

  renderHTML(props) {
    const { HTMLAttributes } = props;
    return ['nkc-attachment-block', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
});
