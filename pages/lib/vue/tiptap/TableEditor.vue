<template lang="pug">
  draggable-dialog(title="插入表格" width="20rem" height="24rem" heightXS="70%" ref="draggableDialog")
    div.tiptap-table-editor-root
      div.tiptap-table-editor-content(@mouseleave="rowHover = 0; colHover = 0;")
        div(v-for="rowItem in rows")
          div(
            v-for="colItem in cols"
            @mouseenter="onMouseEnter(rowItem, colItem)"
            @click="onSelect(rowItem, colItem)"
            :class="{'hover': rowItem <= rowHover && colItem <= colHover, 'select': rowItem <= row && colItem <= col}"
            )
      div.tiptap-table-editor-form
        span 行
        input(type="text" v-model.number="row")
        span 列
        input(type="text" v-model.number="col")
      div.p-l-1.p-r-1.m-t-05
        button.btn.btn-primary.btn-sm.btn-block(:disabled="row === 0 || col === 0" @click="submit") 确定
</template>

<script>
import DraggableDialog from '../DraggableDialog/DraggableDialog.vue';

export default {
  components: {
    'draggable-dialog': DraggableDialog,
  },
  data: () => ({
    row: 0,
    col: 0,
    rowHover: 0,
    colHover: 0,
    rows: [1, 2, 3, 4, 5, 6, 7, 8],
    cols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    callback: null,
  }),
  methods: {
    open(callback) {
      this.callback = callback;
      this.$refs.draggableDialog.open();
    },
    close() {
      this.$refs.draggableDialog.close();
    },
    onMouseEnter(row, col) {
      this.rowHover = row;
      this.colHover = col;
    },
    onSelect(row, col) {
      this.row = row;
      this.col = col;
    },
    submit() {
      if(!this.callback) return;
      this.callback({
        row: this.row,
        col: this.col,
      });
      this.close();
    }
  }
}
</script>

<style scoped lang="less">
.tiptap-table-editor-root{
  background-color: #fff;
}
.tiptap-table-editor-form{
  display: flex;
  align-items: center;
  input{
    width: 5rem;
  }
  padding: 0 1rem;
  margin-top: 1rem;
  &>*{
    margin-right: 0.5rem;
  }
}
.tiptap-table-editor-content{
  padding: 1rem 1rem 0 1rem;
  &>div{
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    &>div{
      height: 1.2rem;
      width: 1.2rem;
      background-color: #fff;
      border: 1px solid #999;
      cursor: pointer;
      &.hover{
        background-color: #cfffcf;
      }
    }
  }
}
</style>