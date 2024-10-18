import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';

import Component from './Component.vue';

export default Node.create({
  name: 'nkc-file-status-inline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: '',
      info: '',
      process: 0,
    };
  },

  parseHTML() {
    return [
      {
        tag: 'nkc-file-status-inline',
      },
    ];
  },

  renderHTML(props) {
    const { HTMLAttributes } = props;
    return ['nkc-file-status-inline', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
});
