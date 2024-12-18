import { mergeAttributes, Node } from '@tiptap/vue-2';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import Component from './Component.vue';
const nodeName = 'nkc-code-block';

export default Node.create({
  name: nodeName,
  group: 'block',
  content: 'text*',

  addAttributes() {
    return {
      language: 'text',
    };
  },

  parseHTML() {
    return [
      {
        tag: nodeName,
      },
    ];
  },

  renderHTML(props) {
    const { HTMLAttributes } = props;
    return [nodeName, mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const inNode = isInCustomNode(editor);
        const { state } = editor.view;
        const { $from } = state.selection;
        const { commands } = editor;
        //  editor.state.selection.$from.parent
        if (
          inNode &&
          $from.node($from.depth).type.name === 'paragraph' &&
          $from.node($from.depth - 1).type.name === nodeName
        ) {
          commands.splitBlock();
          return true;
        }
        return false;
      },
    };
  },
});

function isInCustomNode(editor) {
  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;
  const nodeStartPos = $from.start();
  const nodeEndPos = $from.end();
  return selection.from >= nodeStartPos && selection.to <= nodeEndPos;
}
