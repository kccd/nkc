import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';

import Component from './Component.vue';

export default Node.create({
  name: 'nkc-note-tag',
  group: 'inline',
  inline: true,
  // content: 'inline+',
  atom: true,

  addAttributes() {
    return {
      id: '', //note-id
      start: false,
      end: false,
    };
  },
  // 后期可以完善直接吐出span以及内部的自定义标签,防止粘贴复制多个笔记节点混淆
  // parseHTML() {
  //   return [
  //     {
  //       tag: 'nkc-note-tag',
  //     },
  //   ];
  // },

  // renderHTML(props) {
  //   const { HTMLAttributes } = props;
  //   return ['nkc-note-tag', mergeAttributes(HTMLAttributes)];
  // },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
});
