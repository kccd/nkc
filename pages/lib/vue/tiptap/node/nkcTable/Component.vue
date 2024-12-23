<template lang="pug">
  node-view-wrapper(:class="$style.container")
    .table-toolbar.p-t-05
      button.m-r-05.m-b-05.btn.btn-default.btn-xs(@mousedown="toggleHeaderRow" :disabled="!isTableFocused") 标题行
      button.m-r-05.m-b-05.btn.btn-default.btn-xs(@mousedown="toggleHeaderCell" :disabled="!isTableFocused") 标题列
      button.m-r-05.m-b-05.btn.btn-default.btn-xs(@mousedown="addRow" :disabled="!isTableFocused") 添加行
      button.m-r-05.m-b-05.btn.btn-default.btn-xs(@mousedown="addColumn" :disabled="!isTableFocused") 添加列
      button.m-r-05.m-b-05.btn.btn-default.btn-xs(@mousedown="removeRow" :disabled="!isTableFocused") 删除行
      button.m-r-05.m-b-05.btn.btn-default.btn-xs(@mousedown="removeColumn" :disabled="!isTableFocused") 删除列
      button.m-r-05.m-b-05.btn.btn-danger.btn-xs(@mousedown="removeTable" :disabled="!isTableFocused") 删除表格
    node-view-content(as="table")
</template>

<script>
import { nodeViewProps, NodeViewWrapper, NodeViewContent } from '@tiptap/vue-2';

export default {
  components: {
    'node-view-wrapper': NodeViewWrapper,
    'node-view-content': NodeViewContent,
  },
  props: nodeViewProps,
  data: () => ({
    isTableFocused: false,
  }),
  mounted() {
    this.editor.on('selectionUpdate', this.updateTableFocus);
  },
  beforeDestroy() {
    this.editor.off('selectionUpdate', this.updateTableFocus);
  },
  methods: {
    isCursorInTable() {
      const { selection } = this.editor.state;
      const { $from } = selection;

      // 遍历从当前选区位置到根节点的路径
      for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (node === this.node) {
          return true;
        }
      }
      return false;
    },
    updateTableFocus() {
      this.isTableFocused = this.isCursorInTable();
    },
    toggleHeaderRow(e) {
      e.preventDefault();
      this.editor.chain().focus().toggleHeaderRow().run();
    },
    toggleHeaderCell(e) {
      e.preventDefault();
      this.editor.chain().focus().toggleHeaderColumn().run();
    },
    addRow(e) {
      e.preventDefault();
      this.editor.chain().focus().addRowAfter().run();
    },
    addColumn(e) {
      e.preventDefault();
      this.editor.chain().focus().addColumnAfter().run();
    },
    removeRow(e) {
      e.preventDefault();
      this.editor.chain().focus().deleteRow().run();
    },
    removeColumn(e) {
      e.preventDefault();
      this.editor.chain().focus().deleteColumn().run();
    },
    removeTable(e) {
      e.preventDefault();
      this.deleteNode();
      // this.editor.chain().focus().deleteTable().run();
    },
  },
};
</script>

<style scoped lang="less" module>
.table-toolbar {
  user-select: none;
}
.container {
  margin-bottom: 0.5rem;
}
</style>
