import { Extension } from '@tiptap/core';

export const HotKeys = Extension.create({
  name: 'hotKeys',

  addOptions() {
    return {
      onSave: () => {},
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-s': () => {
        this.options.onSave();
        return true;
      },
    };
  },
});
