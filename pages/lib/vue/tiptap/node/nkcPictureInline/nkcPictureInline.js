import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';

import Component from './Component.vue';

export default Node.create({
  name: 'nkc-picture-inline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: '',
    };
  },

  parseHTML() {
    return [
      {
        tag: 'nkc-picture-inline',
      },
    ];
  },

  renderHTML(props) {
    const { HTMLAttributes } = props;
    return ['nkc-picture-inline', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
});
