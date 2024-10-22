import { mergeAttributes } from '@tiptap/core';
import { Table as TiptapTable } from '@tiptap/extension-table';
import { createColGroup } from '@tiptap/extension-table';

export const nkcTable = TiptapTable.extend({
  addNodeView() {
    return ({ editor }) => {
      const table = document.createElement('table');
      table.classList.add('custom-table');

      /* 
      拓展后的table，无法通过拖动修改单元格的宽度
      尝试下面的代码，能够通过拖动修改单元格的宽度，但无法实时预览新的宽度
      暂时注释掉，后期有需要再来研究
      */
      /*
      const colGroup = document.createElement('colgroup');
      for (let i = 0; i < node.firstChild.content.content.length; i++) {
        const { colwidth } = node.firstChild.content.content[i].attrs;
        const col = document.createElement('col');
        if (colwidth) {
          col.setAttribute('style', `width: ${colwidth[0]}px`);
        } else {
          col.removeAttribute('style');
        }
        colGroup.appendChild(col);
      }
      table.appendChild(colGroup); */

      const toolbar = document.createElement('div');
      toolbar.classList.add('table-toolbar');

      const addRowAfterButton = createTableButton({
        title: '插入行',
        onClick: () => {
          editor.chain().focus().addRowAfter().run();
        },
      });
      const addColAfterButton = createTableButton({
        title: '插入列',
        onClick: () => {
          editor.chain().focus().addColumnAfter().run();
        },
      });
      const deleteRowButton = createTableButton({
        title: '删除行',
        onClick: () => {
          editor.chain().focus().deleteRow().run();
        },
      });
      const deleteColButton = createTableButton({
        title: '删除列',
        onClick: () => {
          editor.chain().focus().deleteColumn().run();
        },
      });
      const deleteTableButton = createTableButton({
        title: '删除表格',
        onClick: () => {
          editor.chain().focus().deleteTable().run();
        },
      });

      toolbar.appendChild(addRowAfterButton);
      toolbar.appendChild(addColAfterButton);
      toolbar.appendChild(deleteRowButton);
      toolbar.appendChild(deleteColButton);
      toolbar.appendChild(deleteTableButton);

      const contentDOM = document.createElement('tbody');
      table.appendChild(contentDOM);

      const wrapper = document.createElement('div');
      wrapper.classList.add('tableWrapper');
      wrapper.appendChild(toolbar);
      wrapper.appendChild(table);
      return {
        dom: wrapper,
        contentDOM,
        update: () => {
          return true;
        },
      };
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const { colgroup, tableWidth, tableMinWidth } = createColGroup(
      node,
      this.options.cellMinWidth,
    );

    return [
      'table',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style: tableWidth
          ? `width: ${tableWidth}`
          : `min-width: ${tableMinWidth}`,
      }),
      colgroup,
      ['tbody', 0],
    ];
  },
});

function createTableButton(props) {
  const { title, onClick } = props;
  const button = document.createElement('button');
  button.innerText = title;

  button.onmousedown = (e) => {
    e.preventDefault();
    onClick();
  };

  return button;
}
