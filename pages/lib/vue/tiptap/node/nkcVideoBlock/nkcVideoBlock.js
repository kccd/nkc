import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';

import Component from './Component.vue';

export default Node.create({
  name: 'nkc-video-block',
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
        tag: 'nkc-video-block',
      },
    ];
  },

  renderHTML(props) {
    const { HTMLAttributes } = props;
    return ['nkc-video-block', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
});
