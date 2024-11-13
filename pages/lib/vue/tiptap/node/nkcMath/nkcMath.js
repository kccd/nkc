import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';

import Component from './Component.vue';

export default Node.create({
  name: 'nkc-math',
  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return {
      mathSelector: null,
    };
  },

  addAttributes() {
    return {
      text: '',
      block: false,
    };
  },

  parseHTML() {
    return [
      {
        tag: 'nkc-math',
      },
    ];
  },

  renderHTML(props) {
    const { HTMLAttributes } = props;
    return ['nkc-math', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },

  addCommands() {
    return {
      openMathSelector:
        (callback, { text, block }) =>
        () => {
          if (this.options.mathSelector) {
            this.options.mathSelector.open(callback, {
              text,
              block,
            });
          }

          return true;
        },
    };
  },
});
