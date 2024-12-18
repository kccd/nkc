<template lang="pug">
  .tiptap-editor-container
    link-editor(ref='linkEditor')
    .tiptap-editor-toolBar(v-if='editor' :style="{ top:isApp ? '0rem' : '4rem' }")
      .tiptap-editor-toolBar-icon-group
        div(@click='editor.chain().focus().undo().run()' title="撤销 Ctrl + Z")
          <return theme="filled" :size="iconFontSize" />
        div(@click='editor.chain().focus().redo().run()' title="重做 Ctrl + Shift + Z")
          <go-on theme="filled" :size="iconFontSize" />
        div(
          @click='editor.chain().focus().toggleBold().run()',
          :class='editorIsActive("bold")',
          title='粗体 Ctrl + B'
        )
          <text-bold theme="filled" :size="iconFontSize" />
        div(
          @click='editor.chain().focus().toggleItalic().run()',
          :class='editorIsActive("italic")',
          title='斜体 Ctrl + I'
        )
          <text-italic theme="filled" :size="iconFontSize" />
        div(
          @click='editor.chain().focus().toggleUnderline().run()',
          :class='editorIsActive("underline")',
          title='下划线 Ctrl + U'
        )
          <text-underline theme="filled" :size="iconFontSize" />
        div(
          @click='editor.chain().focus().toggleStrike().run()',
          :class='editorIsActive("strike")',
          title='删除线 Ctrl + Shift + S'
        )
          <strikethrough theme="filled" :size="iconFontSize" />
        div(
          @click='editor.chain().focus().clearNodes().unsetAllMarks().run()',
          title='清除格式'
        )
          <clear-format theme="outline" :size="iconFontSize" />
        select(
          style='width: 4.5rem;'
          :value='getFontFamily()',
          @click='setFontFamily',
          @blur='isFontFamilySelectOpen = false'
        )
          option(
            v-for='font in fontFamilies'
            :value='font[0]'
            :style="`font-family: ${font[0]}`"
          ) {{font[1]}}
        select(
          :value='getHeadline()',
          @click='setHeadline',
          @blur='isHeadlineSelectOpen = false'
        )
          option(value='0') 正文
          option(value='1') 标题1
          option(value='2') 标题2
          option(value='3') 标题3
          option(value='4') 标题4
          option(value='5') 标题5
          option(value='6') 标题6
        select.m-r-05(
          :value='getFontSize()',
          @click='setFontSize',
          @blur='isFontSizeSelectOpen = false'
        )
          option(
            v-for='size in nkcFontSizeOptions.sizes',
            :key='size',
            :value='size'
          ) {{ size }}
        .m-r-05(data-type='custom')
          text-color-icon(
            title='文字颜色',
            @select='selectedTextColor',
            category='color'
          )
        .m-r-05(data-type='custom')
          text-color-icon(
            title='背景颜色',
            @select='selectedBGColor',
            category='backgroundColor'
          )
        div(
          @click='setLink',
          :class='{ "is-active": editor.isActive("link") }',
          title='插入链接'
        )
          <link-one theme="filled" :size="iconFontSize" />
        div(@click='editor.chain().focus().unsetLink().run()', title='取消链接')
          <unlink theme="filled" :size="iconFontSize" />
        div(
          @click='editor.chain().focus().toggleOrderedList().run()',
          :class='editorIsActive("orderedList")',
          title='有序列表'
        )
          <list-numbers theme="outline" :size="iconFontSize" />
        div(
          @click='editor.chain().focus().toggleBulletList().run()',
          :class='editorIsActive("bulletList")',
          title='无序列表'
        )
          <list-two theme="outline" :size="iconFontSize" />
        div(
          @click='editor.chain().focus().toggleBlockquote().run()',
          :class='editorIsActive("blockquote")',
          title='引用'
        )
          <quote theme="outline" :size="iconFontSize" />
        div(
          @click='editor.chain().focus().toggleCode().run()',
          :class='{ "is-active": editor.isActive("code") }',
          title='代码'
        )
          <code-one theme="filled" :size="iconFontSize" />
        div(
          @click='editor.chain().focus().setTextAlign("left").run()',
          title='左对齐',
          :class='editorIsActive({ textAlign: "left" })'
        )
          <align-text-left theme="outline" :size="iconFontSize" />
        div(
          @click='editor.chain().focus().setTextAlign("center").run()',
          title='居中',
          :class='editorIsActive({ textAlign: "center" })'
        )
          <align-text-center theme="outline" :size="iconFontSize" />
        div(
          @click='editor.chain().focus().setTextAlign("right").run()',
          title='右对齐',
          :class='editorIsActive({ textAlign: "right" })'
        )
          <align-text-right theme="outline" :size="iconFontSize" />
        div(
          @click='setTextIndent'
          title='首行缩进',
          :class='editorIsActive({ textIndent: 2 })'
        )
          <indent-left theme="outline" :size="iconFontSize" />
        div.tiptap-editor-subscript(
          @click='editor.chain().focus().toggleSubscript().run()',
          :class='{ "is-active": editor.isActive("subscript") }'
        )
          <i class="fa fa-subscript" />
        div.tiptap-editor-subscript(
          @click='editor.chain().focus().toggleSuperscript().run()',
          :class='{ "is-active": editor.isActive("superscript") }'
        )
          <i class="fa fa-superscript" />
        div(
          @click="appMenuClick('resource')"
          title="插入资源"
        )
          new-picture(theme="outline" :size="iconFontSize")
        div(data-type='custom')
          app-menu(ref='appMenu', @select='appMenuClick')

    .tiptap-editor-content(@click.stop="editor.commands.focus()")
      editor-content(:editor='editor' ref="tiptapEditorContent")
    .word-count
      span(:style="currentTextLength>initConfig.maxWordCount?'color:#ff6262;':''") {{`${currentTextLength}`}}
      span {{`/${initConfig.maxWordCount}`}}
    //-.mask.m-b-1(v-show="!!loading")
      loading
    resource-selector(ref='resourceSelector')
    table-editor(ref='tableEditor')
    sticker-selector(ref='stickerSelector')
    draft-selector(ref='draftSelector')
    math-selector(ref='mathSelector')
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2';
import Document from '@tiptap/extension-document';
import Italic from '@tiptap/extension-italic';
import History from '@tiptap/extension-history';
import Bold from '@tiptap/extension-bold';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Strike from '@tiptap/extension-strike';
import Superscript from '@tiptap/extension-superscript';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Code from '@tiptap/extension-code';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import nkcEmoji from './tiptap/node/nkcEmoji/nkcEmoji.js';
import nkcNoteTag from './tiptap/node/nkcNoteTag/nkcNoteTag.js';
import nkcSticker from './tiptap/node/nkcSticker/nkcSticker.js';
import nkcPictureBlock from './tiptap/node/nkcPictureBlock/nkcPictureBlock.js';
import nkcPictureInline from './tiptap/node/nkcPictureInline/nkcPictureInline.js';
import nkcPictureFloat from './tiptap/node/nkcPictureFloat/nkcPictureFloat.js';
import EnsureTrailingParagraph from './tiptap/plugins/EnsureTrailingProagraph.js';
import nkcVideoBlock from './tiptap/node/nkcVideoBlock/nkcVideoBlock.js';
import nkcXSFLimit from './tiptap/node/nkcXSFLimit/nkcXSFLimit.js';
import nkcMath from './tiptap/node/nkcMath/nkcMath.js';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Heading from '@tiptap/extension-heading';
import LinkEditor from './LinkEditor.vue';
import BulletList from '@tiptap/extension-bullet-list';
import nkcFontSize, { nkcFontSizeOptions } from './tiptap/marks/nkcFontSize.js';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TextAlign from '@tiptap/extension-text-align';
import TextColorIcon from './tiptap/TextColorIcon.vue';
import Highlight from '@tiptap/extension-highlight';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import TableEditor from './tiptap/TableEditor.vue';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import StickerSelector from './StickerSelector/StickerSelector.vue';
import DraftSelector from './DraftSelector.vue';
import HardBreak from '@tiptap/extension-hard-break';
import { nkcParagraph } from './tiptap/node/nkcParagraph.js';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Placeholder from '@tiptap/extension-placeholder';
import Gapcursor from '@tiptap/extension-gapcursor';
import {
  ClearFormat,
  AlignTextLeft,
  AlignTextCenter,
  AlignTextRight,
  Quote,
  Minus,
  Terminal,
  ListNumbers,
  ListTwo,
  Return,
  GoOn,
  TextBold,
  TextItalic,
  TextUnderline,
  LinkOne,
  Unlink,
  RightSmallDown,
  RightSmallUp,
  Strikethrough,
  Code as CodeIcon,
  CodeOne,
  AddPicture,
  MoreOne,
  FontSizeTwo,
  IndentLeft,
  NewPicture,
} from '@icon-park/vue';
import ResourceSelector from './ResourceSelector.vue';
import nkcAudioBlock from './tiptap/node/nkcAudioBlock/nkcAudioBlock.js';
import nkcAttachmentBlock from './tiptap/node/nkcAttachmentBlock/nkcAttachmentBlock.js';
import nkcFileStatusBlock from './tiptap/node/nkcFileStatusBlock/nkcFileStatusBlock.js';
import nkcFileStatusInline from './tiptap/node/nkcFileStatusInline/nkcFileStatusInline.js';
import { PasteOrDropFile } from './tiptap/plugins/PasteOrDropFile.js';
import AppMenu from './tiptap/menus/AppMenu.vue';
import { nkcTable } from './tiptap/node/nkcTable/nkcTable.js';
import MathSelector from './MathSelector.vue';
import Loading from './Loading.vue';
import { getRichJsonContentLength } from '../js/checkData';
import { immediateDebounce } from '../js/execution';
import { HotKeys } from './tiptap/plugins/HotKeys';
import { getState } from '../js/state.js';
import { resetSelectionEvent } from '../../global/event.js';
import nkcCodeBlock from './tiptap/node/nkcCodeBlock/nkcCodeBlock';
import { logger } from '../js/logger';

export default {
  props: ['config', 'loading'],
  components: {
    'link-editor': LinkEditor,
    'more-one': MoreOne,
    'clear-format': ClearFormat,
    'align-text-left': AlignTextLeft,
    'align-text-center': AlignTextCenter,
    'align-text-right': AlignTextRight,
    minus: Minus,
    quote: Quote,
    Terminal: Terminal,
    'list-numbers': ListNumbers,
    'list-two': ListTwo,
    'editor-content': EditorContent,
    return: Return,
    'go-on': GoOn,
    'text-bold': TextBold,
    'text-italic': TextItalic,
    'text-underline': TextUnderline,
    'link-one': LinkOne,
    unlink: Unlink,
    'right-small-down': RightSmallDown,
    'right-small-up': RightSmallUp,
    'code-icon': CodeIcon,
    'code-one': CodeOne,
    'add-picture': AddPicture,
    'resource-selector': ResourceSelector,
    strikethrough: Strikethrough,
    'text-color-icon': TextColorIcon,
    'font-size-two': FontSizeTwo,
    'bubble-menu': BubbleMenu,
    'app-menu': AppMenu,
    'table-editor': TableEditor,
    'sticker-selector': StickerSelector,
    'draft-selector': DraftSelector,
    'math-selector': MathSelector,
    'indent-left': IndentLeft,
    loading: Loading,
    'new-picture': NewPicture,
  },

  data() {
    return {
      editor: null,
      isApp: getState().isApp,
      iconFontSize: 16,
      headline: 0,
      isHeadlineSelectOpen: false,
      nkcFontSizeOptions,
      isFontSizeSelectOpen: false,
      isFontFamilySelectOpen: false,
      fontFamilies: [
        ['Arial', 'Arial'],
        ['SimSun', '宋体'],
        ['SimHei', '黑体'],
        ['KaiTi', '楷体'],
        ['FangSong', '仿宋'],
        ['Microsoft YaHei', '微软雅黑'],
        ['Impact', 'Impact'],
        ['Tahoma', 'Tahoma'],
        ['Verdana', 'Verdana'],
      ],
      jsonContent: '',
      initConfig: {
        minHeight: 800,
        maxWordCount: 100000,
      },
      currentTextLength: 0,
      noticeFunc: null,
      // 兼容旧编辑器
      ready: false,
    };
  },
  created() {
    const { config } = this;
    if (config) {
      this.initConfig.minHeight = config.minHeight ?? this.initConfig.minHeight;
      this.initConfig.maxWordCount =
        config.maxWordCount ?? this.initConfig.maxWordCount;
    }
  },
  mounted() {
    this.initEditor();
    this.initNoticeEvent();
    resetSelectionEvent();
  },

  methods: {
    getHTML() {
      return this.editor.getHTML();
    },
    getJSON() {
      return this.editor.getJSON();
    },
    initEditorMinHeight() {
      const div = this.$refs.tiptapEditorContent.$el.querySelector(
        'div[contenteditable="true"]',
      );
      if (!div) return;
      div.style.minHeight = this.initConfig.minHeight + 'px';
    },
    setJSON(jsonString) {
      if (!jsonString) return;
      let jsonData;
      try {
        jsonData = JSON.parse(jsonString);
      } catch (err) {
        jsonData = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: err.message,
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: jsonString,
                },
              ],
            },
          ],
        };
      }
      this.editor.commands.setContent(jsonData);
      this.updateTextLength();
    },
    getText() {
      return this.editor.getText();
    },
    //==>兼容旧编辑器
    getContentTxt() {
      return this.editor.getText();
    },
    // 获取JSON字符串数据
    getContent() {
      return JSON.stringify(this.getJSON());
    },
    // 定时更新文本长度
    updateTextLength: immediateDebounce(function () {
      this.currentTextLength = this.getTextLength();
    }, 1000),
    // 获取文本长度
    getTextLength() {
      return getRichJsonContentLength(this.getJSON());
    },
    // 设置JSON字符串数据
    setContent(jsonString) {
      this.setJSON(jsonString);
    },
    // 抛出内容更新的事件
    emitContentChangeEvent() {
      const newContent = this.getContent();
      this.$emit('content-change', newContent);
    },
    // 抛出编辑器准备完毕的事件
    emitEditorReadyEvent() {
      this.$emit('ready');
    },
    // 隐藏加载动画
    hideLoading() {
      this.loading = false;
    },

    initEditor() {
      this.editor = new Editor({
        content: '',
        extensions: [
          HotKeys.configure({
            onSave: () => {
              this.$emit('manual-save');
            },
          }),
          HardBreak,
          // Image.configure({
          //   inline: true,
          // }),
          Placeholder.configure({
            placeholder: '开始输入...',
          }),
          Gapcursor,
          TaskItem.configure({
            nested: false,
          }),
          TaskList,
          nkcTable,
          TableRow,
          TableHeader,
          TableCell,
          Highlight.configure({
            multicolor: true,
            HTMLAttributes: { style: 'padding:0;' },
          }),
          TextAlign.configure({
            types: ['heading', 'paragraph'],
          }),
          HorizontalRule,
          CodeBlock,
          nkcCodeBlock,
          Blockquote,
          nkcFontSize,
          Heading,
          Color,
          TextStyle,
          FontFamily,
          BulletList,
          OrderedList,
          ListItem,
          History,
          Superscript,
          Subscript,
          Strike,
          Link.configure({
            openOnClick: false,
            defaultProtocol: 'https',
          }),
          Bold,
          Code,
          Document,
          nkcParagraph,
          Text,
          Italic,
          Underline,
          nkcEmoji,
          nkcNoteTag,
          nkcSticker,
          nkcPictureBlock,
          nkcPictureInline,
          nkcPictureFloat,
          EnsureTrailingParagraph,
          nkcVideoBlock,
          nkcXSFLimit,
          nkcMath.configure({
            mathSelector: this.$refs.mathSelector,
          }),
          nkcAudioBlock,
          nkcAttachmentBlock,
          PasteOrDropFile,
          nkcFileStatusBlock,
          nkcFileStatusInline,
        ],
        onCreate: () => {
          this.initEditorMinHeight();
          this.emitEditorReadyEvent();
          this.ready = true;
        },
        onUpdate: () => {
          this.emitContentChangeEvent();
          this.updateTextLength();
        },
      });
      this.updateTextLength();
    },
    editorIsActive(name) {
      return this.editor.isActive(name) ? 'is-active' : '';
    },
    setTextIndent() {
      if (this.editor.isActive({ textIndent: 2 })) {
        this.editor
          .chain()
          .focus()
          .updateAttributes('paragraph', { textIndent: 0 })
          .run();
      } else {
        this.editor
          .chain()
          .focus()
          .updateAttributes('paragraph', { textIndent: 2 })
          .run();
      }
    },
    setLink() {
      const link = this.editor.getAttributes('link');
      // 拓展选区
      this.editor.chain().focus().extendMarkRange('link').run();
      // 获取选区位置
      const { from, to } = this.editor.state.selection;
      // 读取链接文本
      const linkText = this.editor.state.doc.textBetween(from, to, ' ');
      this.$refs.linkEditor.open(
        (res) => {
          // empty
          if (res.href === '') {
            this.editor
              .chain()
              .focus()
              .extendMarkRange('link')
              .unsetLink()
              .run();

            return;
          }

          // update link
          this.editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({
              href: res.href,
              rel: res.rel,
              target: res.newWindow ? '_blank' : '_self',
            })
            .run();

          this.editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .insertContentAt(
              {
                from: this.editor.state.selection.from,
                to: this.editor.state.selection.to,
              },
              res.text,
            )
            .run();

          this.$refs.linkEditor.close();
        },
        {
          href: link.href || '',
          rel: link.rel || '',
          text: linkText,
          newWindow: link.target === '_blank',
        },
      );
    },
    insertResource(resourceType) {
      const self = this;
      this.$refs.resourceSelector.open(
        (data) => {
          this.editor.commands.focus(); // 确保编辑器获得焦点
          if (data.resources) {
            data = data.resources;
          } else {
            data = [data];
          }
          const insertContent = [];
          for (let i = 0; i < data.length; i++) {
            let source = data[i];
            let type = source.mediaType;
            type = type.substring(5);
            type = type[0].toLowerCase() + type.substring(1);
            switch (type) {
              case 'picture': {
                insertContent.push({
                  type: 'nkc-picture-inline',
                  attrs: {
                    id: source.rid,
                    desc: '',
                  },
                });
                break;
              }
              case 'video':
                insertContent.push({
                  type: 'nkc-video-block',
                  attrs: {
                    id: source.rid,
                    desc: '',
                  },
                });
                break;
              case 'audio': {
                insertContent.push({
                  type: 'nkc-audio-block',
                  attrs: {
                    id: source.rid,
                    name: source.oname,
                    size: source.size,
                  },
                });
                break;
              }
              case 'attachment': {
                insertContent.push({
                  type: 'nkc-attachment-block',
                  attrs: {
                    id: source.rid,
                    // name: source.oname,
                    // size: source.size,
                    // ext: source.ext,
                    // hits: source.hits,
                  },
                });
                break;
              }
              default:
                break;
            }
          }
          if (insertContent.length > 0) {
            self.editor.commands.insertContent([...insertContent]);
            if (insertContent.at(-1).type !== 'nkc-picture-inline') {
              const { state } = self.editor;
              self.editor.commands.setTextSelection({
                from: state.selection.from + 1,
                to: state.selection.from + 1,
              }); // 设置光标位置
              self.editor.commands.selectTextblockStart();
            }
            self.editor.commands.scrollIntoView();
          }
        },
        {
          fastSelect: true,
          resourceType: resourceType,
        },
      );
    },
    getHeadline() {
      for (let i = 1; i <= 6; i++) {
        if (this.editor.isActive('heading', { level: i })) {
          return `${i}`;
        }
      }
      return '0';
    },
    // 设置标题
    // 由于重复点击select相同的option不会重复触发change事件
    // 所有当前方法通过click事件触发，然后手动读取select的值
    // 由于点击select展开option也算一次click，所以需要过滤掉第一次click
    setHeadline(e) {
      if (!this.isHeadlineSelectOpen) {
        this.isHeadlineSelectOpen = true;
      } else {
        if (e.target.value === '0') {
          this.editor.commands.setParagraph();
        } else {
          this.editor
            .chain()
            .focus()
            .toggleHeading({ level: parseInt(e.target.value) })
            .run();
        }
        this.isHeadlineSelectOpen = false;
      }
    },
    /**
     * Return the current font size.
     * @return {string} The size of current font size, default value is nkcFontSizeOptions.defaultSize.
     */
    getFontSize() {
      for (const size of nkcFontSizeOptions.sizes) {
        if (this.editor.isActive('nkc-font-size', { size: size })) {
          return size;
        }
      }
      return nkcFontSizeOptions.defaultSize;
    },
    /**
     * Change the font size.
     * @param {Event} e - The <select> element's change event.
     *
     */
    setFontSize(e) {
      if (!this.isFontSizeSelectOpen) {
        this.isFontSizeSelectOpen = true;
      } else {
        const fontSize = e.target.value;
        if (fontSize === nkcFontSizeOptions.defaultSize) {
          this.editor.commands.unsetFontSize();
        } else {
          this.editor.commands.setFontSize(fontSize);
        }
        this.isFontSizeSelectOpen = false;
      }
    },
    getFontFamily() {
      for (const font of this.fontFamilies) {
        if (this.editor.isActive('textStyle', { fontFamily: font[0] })) {
          return font[0];
        }
      }
      return this.fontFamilies[0][0];
    },
    setFontFamily(e) {
      if (!this.isFontFamilySelectOpen) {
        this.isFontFamilySelectOpen = true;
      } else {
        this.editor.chain().focus().setFontFamily(e.target.value).run();
      }
    },

    /**
     * Select a text color.
     * @param {Object} res - Object returned by ColorPicker.
     * @param {String} res.type - Color type, 'default' or 'custom'.
     * @param {String} res.color - Color in hex.
     */
    selectedTextColor(res) {
      const { type, color } = res;
      if (type === 'default') {
        this.editor.chain().focus().unsetColor().run();
      } else {
        this.editor.chain().focus().setColor(color).run();
      }
    },
    selectedBGColor(res) {
      if (res.type === 'default') {
        this.editor.chain().focus().unsetHighlight().run();
      } else {
        this.editor.chain().focus().toggleHighlight({ color: res.color }).run();
      }
    },
    appMenuClick(type) {
      switch (type) {
        case 'terminal': {
          this.editor
            .chain()
            .focus()
            .insertContent({
              type: 'nkc-code-block',
              attrs: {
                language: 'javascript',
              },
            })
            .run();
          /*this.editor
            .chain()
            .focus()
            .toggleCodeBlock({
              language: 'javascript',
            })
            .run();*/
          return;
        }
        case 'resource': {
          this.insertResource('all');
          return;
        }
        case 'picture': {
          this.insertResource('picture');
          return;
        }
        case 'audio': {
          this.insertResource('audio');
          return;
        }
        case 'video': {
          this.insertResource('video');
          return;
        }
        case 'attachment': {
          this.insertResource('attachment');
          return;
        }
        case 'table': {
          this.$refs.tableEditor.open(
            (res) => {
              this.editor
                .chain()
                .focus()
                .insertTable({
                  rows: res.row,
                  cols: res.col,
                  withHeaderRow: false,
                })
                .run();
            },
            {
              mode: 'fast',
            },
          );
          return;
        }
        case 'sticker': {
          this.$refs.stickerSelector.open((res) => {
            if (res.type === 'emoji') {
              this.editor
                .chain()
                .focus()
                .insertContent({
                  type: 'nkc-emoji',
                  attrs: {
                    unicode: res.data,
                  },
                })
                .run();
            } else if (res.type === 'sticker') {
              this.editor
                .chain()
                .focus()
                .insertContent({
                  type: 'nkc-sticker',
                  attrs: {
                    id: res.data.rid,
                  },
                })
                .run();
            }
          });
          return;
        }
        case 'draft': {
          this.$refs.draftSelector.open((res) => {
            // 后期需要完善判断方式l
            let content = '';
            try {
              content = JSON.parse(res.content);
            } catch (e) {
              content = res.content;
            }
            this.editor.chain().focus().insertContent(content).run();
          });
          return;
        }
        case 'math': {
          this.$refs.mathSelector.open((res) => {
            this.editor
              .chain()
              .focus()
              .insertContent({
                type: 'nkc-math',
                attrs: {
                  text: res.text,
                  block: res.block,
                },
              })
              .run();
          });
          return;
        }
        case 'taskList': {
          this.editor.chain().focus().toggleTaskList().run();
          return;
        }
        case 'xsfLimit': {
          this.editor
            .chain()
            .focus()
            .insertContent({
              type: 'nkc-xsf-limit',
              attrs: {
                xsf: 1,
              },
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '学术分限制',
                    },
                  ],
                },
              ],
            })
            .run();
          return;
        }
        case 'hr': {
          this.editor.chain().focus().setHorizontalRule().run();
          return;
        }
      }
    },
    initNoticeEvent() {
      this.removeNoticeEvent();
      this.noticeFunc = function (e) {
        const info = '关闭页面会导致已输入的数据丢失，确定要继续？';
        e = e || window.event;
        if (e) {
          e.returnValue = info;
        }
        return info;
      };
      window.onbeforeunload = this.noticeFunc;
    },
    removeNoticeEvent() {
      if (!window.onbeforeunload || window.onbeforeunload !== this.noticeFunc)
        return;
      window.onbeforeunload = null;
    },
    clearContent() {
      this.editor.commands.clearContent();
      this.updateTextLength();
    },
  },
  beforeDestroy() {
    this.editor.destroy();
    this.removeNoticeEvent();
  },
};
</script>

<style scoped lang="less">
.tiptap-editor-subscript {
  font-size: 1.3rem;
  padding-top: 0 !important;
}
.tiptap-editor-toolBar {
  display: flex;
  flex-wrap: wrap;
  position: sticky;
  top: 4rem;
  z-index: 999;
  // margin-bottom: 1rem;

  .tiptap-editor-toolBar-icon-group {
    user-select: none;
    background-color: rgba(255, 255, 255, 0.84);
    display: flex;
    align-items: center;
    border-radius: 5px 5px 0 0;
    border: 1px solid #eee;
    padding: 0 1rem;
    flex-wrap: wrap;
    width: 100%;

    & > div {
      cursor: pointer;
      padding-top: 5px;
      height: 2.6rem;
      width: 2.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #777;

      &:hover,
      &.is-active {
        color: #2b90d9;
      }

      &[data-type='custom']:hover,
      &[data-type='custom'].is-active {
        color: #777;
        cursor: inherit;
      }
    }

    & > select {
      background-color: transparent;
      color: #777;
      cursor: pointer;
      outline: none;
      border: none;
    }
  }
}

.tiptap-editor-container {
  position: relative;

  .word-count {
    user-select: none;
    position: absolute;
    bottom: 10px;
    /* 距离底部的距离 */
    right: 10px;
    /* 距离右侧的距离 */
    background-color: rgba(255, 255, 255, 0.8);
    /* 半透明背景 */
    color: #ccc;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 14px;
  }
  .mask {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.7);
  }
}

.tiptap-editor-content {
  padding: 0.5rem 1rem;
  border: 1px solid #eee;
  border-top: none;
  border-radius: 0 0 5px 5px;
  background-color: #fff;
  font-size: 16px;

  &:hover {
    cursor: text;
  }

  ::v-deep {
    .tiptap.resize-cursor {
      cursor: ew-resize;
    }

    // p {
    //   font-size: 16px;
    //   line-height: 30px;
    // }

    .tiptap.ProseMirror {
      outline: none;
    }

    table {
      border-collapse: collapse;
      margin: 0;
      overflow: hidden;
      table-layout: fixed;
      width: 100%;
    }

    td,
    th {
      border: 1px solid rgba(61, 37, 20, 0.12);
      box-sizing: border-box;
      min-width: 1em;
      padding: 6px 8px;
      position: relative;
      vertical-align: top;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      background-color: rgba(61, 37, 20, 0.05);
      font-weight: bold;
      text-align: left;
    }

    .selectedCell:after {
      background: rgba(61, 37, 20, 0.08);
      content: '';
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
      position: absolute;
      z-index: 2;
    }

    .column-resize-handle {
      background-color: #6a00f5;
      bottom: -2px;
      pointer-events: none;
      position: absolute;
      right: -2px;
      top: 0;
      width: 4px;
    }

    /* Task list specific styles */

    ul[data-type='taskList'] {
      list-style: none;
      margin-left: 0;
      padding: 0;

      li {
        align-items: center;
        display: flex;

        & > label {
          margin: 0 0.5rem 0 0;
          user-select: none;
        }

        & > div {
          flex: 1 1 auto;
        }
      }

      input[type='checkbox'] {
        cursor: pointer;
      }

      ul[data-type='taskList'] {
        margin: 0;
      }
    }
  }
}
</style>
