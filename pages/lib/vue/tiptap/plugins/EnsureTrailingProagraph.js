import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

const EnsureTrailingParagraph = Extension.create({
  name: 'ensureTrailingParagraph',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('ensureTrailingParagraph'),
        view: () => {
          return {
            update: (view) => {
              // 防抖处理，避免频繁触发
              this.timer = setTimeout(() => {
                const { doc, selection } = view.state;
                const lastNode = doc.lastChild;

                // 检查最后一个节点是否为空白段落
                if (
                  !lastNode ||
                  lastNode.type.name !== 'paragraph' ||
                  lastNode.content.size > 0
                ) {
                  // 在文档末尾插入一个空白段落
                  const { from, to } = selection;
                  view.dispatch(
                    view.state.tr.insert(
                      doc.content.size,
                      view.state.schema.nodes.paragraph.create(),
                    ),
                  );
                  // 恢复光标位置
                  view.dispatch(
                    view.state.tr.setSelection(
                      view.state.selection.constructor.create(
                        view.state.doc,
                        from,
                        to,
                      ),
                    ),
                  );
                }
              }, 500);
            },
          };
        },
      }),
    ];
  },
});

export default EnsureTrailingParagraph;
