import CodeBlock from '@tiptap/extension-code-block';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.min.css';

export const CodeBock = CodeBlock.extend({
  addNodeView() {
    return ({ node, getPos, editor }) => {
      // 创建容器
      const container = document.createElement('div');
      container.style.position = 'relative';

      // 创建高亮视图 <code> 元素
      const highlightPreDom = document.createElement('pre');
      const highlightCode = document.createElement('code');
      highlightCode.className = `language-${
        node.attrs.language || 'javascript'
      }`;
      highlightPreDom.appendChild(highlightCode);
      highlightPreDom.style.position = 'absolute';
      highlightPreDom.style.top = '0';
      highlightPreDom.style.left = '0';
      highlightPreDom.style.width = '100%';
      highlightPreDom.style.height = '100%';
      highlightPreDom.style.pointerEvents = 'none'; // 禁止鼠标事件影响编辑
      highlightPreDom.style.zIndex = '1'; // 高亮视图在上方

      // 创建 contentDOM 供编辑
      const preDom = document.createElement('pre');
      preDom.style.position = 'relative';
      preDom.style.zIndex = '2';
      preDom.style.background = 'transparent'; // 透明背景
      preDom.style.color = 'rgba(255, 0, 0, 0.2)'; // 透明文本
      preDom.style.caretColor = '#000'; // 光标颜色
      const codeDom = document.createElement('code');
      codeDom.contentEditable = 'true';
      preDom.appendChild(codeDom);

      container.appendChild(highlightPreDom);
      container.appendChild(preDom);

      // 同步高亮视图的内容
      const updateHighlight = () => {
        const content = codeDom.textContent;
        console.log(node.attrs.language || 'plaintext');
        highlightCode.innerHTML = hljs.highlight(content, {
          language: 'javascript',
        }).value;
        console.log({
          content: content,
          html: highlightCode.innerHTML,
        });
      };

      return {
        dom: container,
        contentDOM: codeDom, // 可编辑区域
        update: (updatedNode) => {
          // 当节点属性或内容更新时，重新渲染高亮
          if (updatedNode.attrs.language !== node.attrs.language) {
            highlightCode.className = `language-${updatedNode.attrs.language}`;
          }
          updateHighlight();
          return true;
        },
      };
    };
  },
});

export default CodeBock;
