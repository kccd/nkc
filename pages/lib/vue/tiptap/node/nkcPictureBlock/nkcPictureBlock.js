import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';

import Component from './Component.vue';

export default Node.create({
  name: 'nkc-picture-block',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      id: '',
      desc: '',
    };
  },

  parseHTML() {
    return [
      {
        tag: 'nkc-picture-block',
      },
    ];
  },

  renderHTML(props) {
    const { HTMLAttributes } = props;
    return ['nkc-picture-block', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
});
