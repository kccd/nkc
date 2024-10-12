import Paragraph from '@tiptap/extension-paragraph';

export default Paragraph.extend({
  // 重写默认的 `addAttributes` 方法
  addAttributes() {
    return {
      class: {
        default: 'nkc-paragraph', // 为所有 `p` 节点设置默认的 class
      },
    };
  },

  // 重写 `renderHTML` 方法来确保 class 应用到生成的 HTML 上
  renderHTML({ HTMLAttributes }) {
    return ['p', HTMLAttributes, 0]; // 这里的 HTMLAttributes 包含了 `class`
  },
});
