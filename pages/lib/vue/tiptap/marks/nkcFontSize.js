import { Mark } from '@tiptap/vue-2';

export const nkcFontSizeOptions = {
  sizes: [
    '10px',
    '11px',
    '12px',
    '14px',
    '16px',
    '18px',
    '20px',
    '22px',
    '24px',
    '36px',
  ],
  defaultSize: '16px',
};

export default Mark.create({
  name: 'nkc-font-size',
  addOptions() {
    return nkcFontSizeOptions;
  },
  addAttributes() {
    return {
      size: {
        default: this.options.defaultSize,
        parseHTML: (element) =>
          element.style.fontSize || this.options.defaultSize,
        renderHTML: (attributes) => {
          if (attributes.size) {
            return {
              style: `font-size: ${attributes.size}`,
            };
          }
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[style]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ commands, editor }) => {
          return (
            commands.setMark(this.name, { size }) &&
            editor.chain().focus().run()
          );
        },
      unsetFontSize:
        () =>
        ({ commands, editor }) => {
          return commands.unsetMark(this.name) && editor.chain().focus().run();
        },
    };
  },
});
