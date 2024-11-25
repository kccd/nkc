import Paragraph from '@tiptap/extension-paragraph';

export const nkcParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textIndent: {
        default: 0, // 默认为 0，即无缩进
        parseHTML: (element) => {
          const indentValue = element.style.textIndent;
          return indentValue ? parseFloat(indentValue) : 0;
        },
        renderHTML: (attributes) => {
          if (attributes.textIndent && attributes.textIndent !== 0) {
            return {
              style: `text-indent: ${attributes.textIndent}em;`,
            };
          }
          return {};
        },
      },
    };
  },
});
