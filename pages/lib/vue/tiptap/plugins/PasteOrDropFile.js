import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { UploadResource, UploadResourceV2 } from '../../../js/resource';
import { screenTopWarning } from '../../../js/topAlert';
import { getSocket } from '../../../js/socket';
import { sweetError } from '../../../js/sweetAlert';
import { base64ToFile } from '../../../js/file';
import { nkcAPI } from '../../../js/netAPI';
import { isFileDomainV2 } from '../../../js/url';
import { getState } from '../../../js/state';

const socket = getSocket();
let imageUploadingOrder = Date.now() + Math.round(Math.random() * 10000);
export const PasteOrDropFile = Extension.create({
  name: 'pasteOrDropFile',

  onCreate() {
    socket.on('fileTransformProcess', (data) => {
      handleResources(this.editor, data);
    });
  },
  onDestroy() {
    socket.off('fileTransformProcess', (data) => {
      handleResources(this.editor, data);
    });
  },
  addProseMirrorPlugins() {
    const self = this;
    return [
      new Plugin({
        key: new PluginKey('pasteOrDropFile'),
        props: {
          handlePaste(view, event, slice) {
            event.preventDefault();
            const result = handlePasteAndDropData(
              event.clipboardData,
              self.editor,
            );
            return !!result;
          },
          handleDrop(view, event, slice, moved) {
            event.preventDefault();
            const result = handlePasteAndDropData(
              event.dataTransfer,
              self.editor,
            );
            return !!result;
            // return true;==》阻止拖拽行为
          },
        },
      }),
    ];
  },
});
const handleResources = (editor, data) => {
  const { state, view } = editor;
  if (data.state === 'fileProcessFailed') {
    sweetError(`文件处理失败\n${data.err}`);
    replaceFileStatusAttrs(editor, data.rid, data.rid, '上传失败', 1);
  } else {
    replaceFileStatusNode(editor, data.rid, data.rid);
  }
};
const handlePasteAndDropData = (dataTransfer, editor) => {
  const files = dataTransfer.files;
  const insertContent = [];
  const tempData = [];
  for (const file of files) {
    if (file && file.type.startsWith('image/')) {
      imageUploadingOrder++;
      const $index = imageUploadingOrder.toString();
      // 需要插入上传状态的节点
      insertContent.push({
        type: 'nkc-file-status-block',
        attrs: {
          id: $index,
          info: '上传中',
        },
      });
      tempData.push({
        file,
        id: $index,
      });
    }
  }
  if (insertContent.length > 0) {
    // 对于粘贴行为，在空段落中无法直接插入,需要加一个空段落
    insertContent.push({ type: 'paragraph' });
    editor
      .chain()
      .focus()
      .insertContent([...insertContent])
      .run();
  }
  tempData.forEach((item) => {
    UploadResourceV2({
      file: item.file,
      defaultFileName: 'image.jpg',
      onProgress: (e, index) => {},
    })
      .then((res) => {
        const { uploaded } = res;
        const { rid } = res.r;
        // 需要替换响应的上传状态的节点。。。
        if (!!uploaded) {
          replaceFileStatusNode(editor, item.id, rid);
        } else {
          replaceFileStatusAttrs(editor, item.id, rid, '处理中');
        }
      })
      .catch((err) => {
        // 需要替换响应的上传状态为失败状态。。。
        replaceFileStatusAttrs(editor, item.id, item.id, '上传失败', 1);
        screenTopWarning(
          `Image upload failed: ${err.message || err.toString()}`,
        );
      });
  });
  // html类型==》常常出现在直接从网页里面拖拽而来,可能包含图片等文件
  if (files.length === 0 && dataTransfer.types.includes('text/html')) {
    const srcData = [];
    //处理图片和文本混合的html片段==>提取除img 上传后插入自定义图片节点，并按照文字和图片的顺序
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      dataTransfer.getData('text/html'),
      'text/html',
    );
    const images = doc.querySelectorAll('img');
    images.forEach((img) => {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt');
      // 替换为自定义标签==>对于大多数img场景属于行内式
      // 对于img 的src属性==》绝对链接、相对链接、base64、
      // 1.替换成行内上传状态 2.对于不同类型的src 进行上传，3.更新对应节点的的上传状态

      const { fileDomain } = getState();
      let fileLink = '';
      if (src.indexOf(`${fileDomain}/r/`) === 0) {
        fileLink = fileDomain;
      } else if (src.indexOf(`${window.location.origin}/r/`) === 0) {
        fileLink = window.location.origin;
      }
      if (isFileDomainV2(src) && fileLink) {
        const rid = src.replace(`${fileLink}/r/`, '').split('?')[0];

        const imagTag = document.createElement('nkc-picture-inline');
        imagTag.setAttribute('id', rid);
        img.replaceWith(imagTag);
      } else {
        const customTag = document.createElement('nkc-file-status-inline');
        imageUploadingOrder++;
        const $index = imageUploadingOrder.toString();
        customTag.setAttribute('id', $index);
        customTag.setAttribute('info', '上传中');
        if (src) {
          if (/^https?:\/\/.*$/.test(src)) {
            // 绝对地址
            srcData.push({
              id: $index,
              isAbsoluteUrl: true,
              src,
            });
          } else if (new RegExp(/^data:image\/(jpeg|png|gif);base64,/).test()) {
            // base64==测试时情况较少
            srcData.push({
              id: $index,
              isBase64: true,
              src,
            });
          }
          // 对于其他情形的src内容后期待兼容
          img.replaceWith(customTag);
        }
      }
    });
    editor.chain().focus().insertContent(doc.body.innerHTML).run();
    srcData.forEach((item) => {
      if (item.isAbsoluteUrl) {
        nkcAPI('/download', 'POST', {
          loadsrc: item.src,
        })
          .then((res) => {
            const { rid } = res.r;
            replaceFileStatusAttrs(editor, item.id, rid, '处理中');
            console.log(
              `External image (${item.src}) downloaded successfully, server is processing.`,
            );
          })
          .catch((err) => {
            replaceFileStatusAttrs(editor, item.id, item.id, '上传失败', 1);
            screenTopWarning(
              `Image upload failed: ${err.message || err.toString()}`,
            );
          });
      } else if (item.isBase64) {
        const file = base64ToFile(item.src);
        UploadResourceV2({
          file,
          defaultFileName: 'image.jpg',
        })
          .then((res) => {
            const { rid } = res.r;
            // 需要替换响应的上传状态的节点。。。
            replaceFileStatusAttrs(editor, item.id, rid, '处理中');
          })
          .catch((err) => {
            // 需要替换响应的上传状态为失败状态。。。
            replaceFileStatusAttrs(editor, item.id, item.id, '上传失败', 1);
            screenTopWarning(
              `Image upload failed: ${err.message || err.toString()}`,
            );
          });
      }
    });
  }
  return true;
};
const replaceFileStatusAttrs = (editor, id, rid, info, process = 0) => {
  const { state, view } = editor;
  state.doc.descendants((node, pos) => {
    if (
      (node.type.name === 'nkc-file-status-block' ||
        node.type.name === 'nkc-file-status-inline') &&
      String(node.attrs.id) === String(id)
    ) {
      view.dispatch(
        state.tr.setNodeMarkup(pos, undefined, {
          id: rid,
          info,
          process,
        }),
      );
      return false; //停止检索以后的节点
    }
    return true; // 继续遍历
  });
};
const replaceFileStatusNode = (editor, id, rid) => {
  const { state, view } = editor;

  state.doc.descendants((node, pos) => {
    if (String(node.attrs.id) === String(id)) {
      if (node.type.name === 'nkc-file-status-block') {
        const newNode = state.schema.nodes['nkc-picture-inline'].create({
          id: rid,
          desc: '',
        });
        const transaction = state.tr.replaceWith(
          pos,
          pos + node.nodeSize,
          newNode,
        );
        view.dispatch(transaction);
      } else if (node.type.name === 'nkc-file-status-inline') {
        const newNode = state.schema.nodes['nkc-picture-inline'].create({
          id: rid,
          desc: '',
        });
        const transaction = state.tr.replaceWith(
          pos,
          pos + node.nodeSize,
          newNode,
        );
        view.dispatch(transaction);
      }

      return false; // Stop traversal after replacing the node
    }
  });
};
