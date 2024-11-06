import TiptapTable from '@tiptap/extension-table';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import Component from './Component.vue';
export const nkcTable = TiptapTable.extend({
  name: 'nkc-table',
  addNodeView() {
    return VueNodeViewRenderer(Component, {
      contentDOMElementTag: 'tbody',
    });
  },
});
