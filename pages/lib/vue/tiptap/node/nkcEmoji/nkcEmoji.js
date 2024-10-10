import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';

import Component from './Component.vue';

export default Node.create({
  name: 'nkc-emoji',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      unicode: '',
    };
  },

  parseHTML() {
    return [
      {
        tag: 'nkc-emoji',
      },
    ];
  },

  renderHTML(props) {
    const { HTMLAttributes } = props;
    return ['nkc-emoji', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
});
