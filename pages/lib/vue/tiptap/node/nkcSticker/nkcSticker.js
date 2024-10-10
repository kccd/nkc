import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import Component from './Component.vue';

export default Node.create({
  name: 'nkc-sticker',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: '',
    };
  },

  parseHTML() {
    return [{ tag: 'nkc-sticker' }];
  },

  renderHTML(props) {
    const { HTMLAttributes } = props;
    return ['nkc-sticker', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
});
