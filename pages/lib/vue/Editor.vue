<template lang="pug">
  .editor
    .bg-danger.text-danger.p-a-1.text-center(v-if="errorInfo") 编辑器初始化失败： {{errorInfo}}
    div(v-else)
      resource-selector(ref="resourceSelector")
      draft-selector(ref="draftSelector")
      sticker-selector(ref="stickerSelector")
      xsf-selector(ref="xsfSelector")
      math-jax-selector(ref="mathJaxSelector")
      drafts-selector(ref="draft")
      .editor-container(:id="domId")
        .save-info(:class="saveInfoClass" ref="saveInfo")
          .save-success(v-if="saveInfo === 'succeeded'")
            .fa.fa-check-circle.m-r-05
            span 内容已保存
          .save-filed(v-if="saveInfo === 'failed'")
            .fa.fa-remove.m-r-05
            span 内容保存失败
          .save-saving(v-if="saveInfo === 'saving'") 内容保存中...
</template>

<style lang="less" scoped>
  .editor{
    background-color: #f4f4f4;
    .editor-container {
      position: relative;
    }
    .save-info {
      text-align: right;
      z-index: 1000;
      margin: auto;
      position: absolute;
      top: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0);
      font-size: 1.2rem;
      transition: opacity 200ms;
      opacity: 0;
      &.succeeded, &.failed, &.saving{
        opacity: 1;
      }
      .save-success {
        color: #2b90d9;
      }
      .save-filed {
        color: #e85a71;
      }
      .save-saving {
        color: #666;
      }
    }
  }
</style>

<script>
  import '../../../pages/ueditor/ueditor.less';
  import '../../../pages/ueditor/ueditor.config';
  import '../../../pages/ueditor/ueditor.all.js';
  import {getUrl} from "../js/tools";
  import {initDblclick} from "../js/dblclick";
  import {resourceToHtml} from "../js/dataConversion";
  import ResourceSelector from './ResourceSelector';
  import DraftSelector from './DraftSelector';
  import StickerSelector from './StickerSelector';
  import MathJaxSelector from "./MathJaxSelector";
  import XsfSelector from './XsfSelector';
  import DraftsSelector from "./DraftsSelector";
  export default {
    props: ['configs', 'plugs'],
    components: {
      'resource-selector': ResourceSelector,
      'draft-selector': DraftSelector,
      'sticker-selector': StickerSelector,
      'math-jax-selector': MathJaxSelector,
      'xsf-selector': XsfSelector,
      'drafts-selector': DraftsSelector,
    },
    data: () => ({
      domId: '',
      errorInfo: '',
      noticeFunc: null,
      saveInfo: '', //消息dom显示
      saveInfoClass: '', //消息框dom显示
      infoTime: '',
      ready: false,
      defaultPlugs: {
        resourceSelector: true,
        draftSelector: true,
        stickerSelector: true,
        xsfSelector: true,
        mathJaxSelector: true,
      },
      defaultConfigs: {
        toolbars: [
          [
            'undo', 'redo', '|',
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'blockquote', 'horizontal', 'superscript', 'subscript', '|',
            'fontfamily', 'fontsize', 'forecolor', 'backcolor', '|',
            'indent', /*'insertorderedlist', 'insertunorderedlist',*/ '|',
            'link', 'unlink', '|',
            'inserttable', '|',
            'removeformat', 'pasteplain', '|',
            'justifyleft', 'justifycenter', 'justifyright', '|',
            'insertcode', '|',
          ]
        ],
        initialFrameHeight: 500, // 编辑器高度
        autoHeightEnabled: true, // 编辑器是否随着行数增加而自动长高
        scaleEnabled: false, // 是否允许拉长
        autoFloatEnabled: true, // 保持状态栏位置
        topOffset: 50, // toolbar工具栏在滚动时的固定位置
        enableAutoSave: false, // 是否启动自动保存
        elementPathEnabled: false, // 是否显示元素路径
        imageScaleEnabled: false, // 启用图片拉伸缩放
        enableContextMenu: false,
        contextMenu: [],
        focus: false, // 默认获得焦点
        readonly: false, // 只读模式
        wordCount: true, // 是否开启字数统计
        maximumWords: 100, // 最大字符数
        zIndex: 499,
        contentChangeEventFlag: false, //是否允许触发contentChange
      },
    }),
    async mounted () {
      try{
        await this.initDomId();
        await this.initPlugs();
        await this.initEditor();
        await this.initSocketEvent();
        await this.initNoticeEvent();
        await this.contentChange();
      } catch(err) {
        console.log(err);
        this.errorInfo = err.error || err.message || err.toString();
      }
    },
    destroyed() {
      if(this.editor && this.editor.destroy) {
        this.editor.destroy();
      }
      this.removeNoticeEvent();
      this.removeScrollEvent();
    },
    methods: {
      //浏览器窗口大小变化
      watchOnresize() {
        const self = this;
        window.onresize = function() {
          self.setSaveInfo(true);
        };
      },
      //更改内容保存信息
      changeSaveInfo(info) {
        const self = this;
        if(!info) return;
        clearTimeout(self.infoTime);
        if(info === 'saving') {
          self.infoTime = setTimeout(function() {
            self.saveInfo = info;
            self.saveInfoClass = info;
          }, 200);
        } else {
          self.saveInfo = info;
          self.saveInfoClass = info;
          if(info === 'succeeded') {
            setTimeout(function (){
              self.saveInfoClass = '';
              setTimeout(function() {
                self.saveInfo = '';
              }, 200);
            }, 1000);
          }
        }
      },
      contentChange(){
        const  _this = this;
        return this.editor.addListener("contentChange", function () {
          _this.$emit("content-change");
        });
      },
      initDomId() {
        if(this.domId) return;
        this.domId = `editor_id_${Date.now()}_${Math.round(Math.random() * 100000)}`;
      },
      initEditor() {
        const self = this;
        return new Promise((resolve, reject) => {
          const {domId, defaultConfigs, configs = {}} = self;
          self.editor = UE.getEditor(domId, Object.assign({}, defaultConfigs, configs));
          self.editor.ready(resolve);
        })
          .then(() => {
            setTimeout(() => {
              self.ready = true;
              self.$emit('ready');
              self.initScrollEvent();
              self.watchOnresize();
            }, 500)
          });
      },
      scrollEvent() {
        this.setSaveInfo(true);
      },
      //监听屏幕滚动创建文档保存提示dom
      initScrollEvent() {
        const self = this;
        self.setSaveInfo();
        window.addEventListener("scroll", this.scrollEvent);
      },
      removeScrollEvent() {
        window.removeEventListener("scroll", this.scrollEvent);
      },
      setSaveInfo(flag) {
        const self = this;
        if(!self.ready) return;
        const editorDom = $(`#${self.domId}`).find('.edui-editor-toolbarbox').eq(0);
        const editorContainer = $('.editor-container').eq(0);
        const {top: containerTop} = editorContainer.offset();
        const {top} = editorDom.offset();
        const height = editorDom.height();
        const saveInfoDom = $(this.$refs.saveInfo);
        saveInfoDom.css({
          top: flag?top - containerTop + height:height,
        });
      },
      initNoticeEvent() {
        this.removeNoticeEvent();
        this.noticeFunc = function(e) {
          const info = '关闭页面会导致已输入的数据丢失，确定要继续？';
          e = e || window.event;
          if(e) {
            e.returnValue = info;
          }
          return info;
        };
        window.onbeforeunload = this.noticeFunc;
      },
      removeNoticeEvent() {
        if(!window.onbeforeunload || window.onbeforeunload !== this.noticeFunc) return;
        window.onbeforeunload = null;
      },
      async initSocketEvent() {
        const self = this;
        window.socket.on('fileTransformProcess', (data) => {
          self.editor.fireEvent('updateImageState', {
            id: data.rid,
            state: data.state === 'fileProcessFinish',
            src: getUrl('resource', data.rid)
          });
        });
      },
      setContent(content) {
        this.editor.setContent(content);
      },
      insertContent(content) {
        this.editor.execCommand("inserthtml", content);
      },
      //获取编辑器中的完整内容
      getContent() {
        return this.editor.getContent();
      },
      //获取编辑器纯文本内容
      getContentTxt() {
        return this.editor.getContentTxt();
      },
      //获取编辑器文本内容
      getPlainTxt() {
        return this.editor.getPlainTxt();
      },
      initPlugsResourceSelector() {
        const self = this;
        UE.registerUI('resourceSelector',function(editor, uiName){
          return new UE.ui.Button({
            name: uiName,
            title: '插入图片和附件',
            className: 'edui-default edui-for-image-selector edui-icon',
            onclick: function () {
              self.$refs.resourceSelector.open(data => {
                if(data.resources) {
                  data = data.resources;
                } else {
                  data = [data];
                }
                for(let i = 0; i < data.length; i++) {
                  let source = data[i];
                  let type = source.mediaType;
                  type = type.substring(5);
                  type = type[0].toLowerCase() + type.substring(1);
                  editor.execCommand('inserthtml', resourceToHtml(type, source.rid, source.oname));
                }
              }, {
                fastSelect: true
              });
            }
          })
        });
      },
      initDraftSelector() {
        const self = this;
        UE.registerUI('draftSelector',function(editor, uiName){
          return new UE.ui.Button({
            name: uiName,
            title: '草稿箱',
            className: 'edui-default edui-for-draft edui-icon',
            onclick:function () {
              self.$refs.draftSelector.open(data => {
                if(!data || !data.content) return;
                editor.execCommand('inserthtml', data.content);
              });
            }
          });
        });
      },
      initStickerSelector() {
        const self = this;
        UE.registerUI('stickerSelector',function(editor, uiName){
          return new UE.ui.Button({
            name: uiName,
            title:'插入表情',
            className: 'edui-default edui-for-emotion edui-icon',
            onclick:function () {
              self.$refs.stickerSelector.open(res => {
                if(!res) return;
                if(res.type === "emoji") {
                  editor.execCommand('inserthtml', resourceToHtml("twemoji", res.data));
                }else if(res.type === "sticker") {
                  editor.execCommand('inserthtml', resourceToHtml("sticker", res.data.rid));
                }
              });
            }
          })
        });
      },
      initMathJaxSelector() {
        const self = this;
        UE.registerUI('mathJaxSelector', function (editor, uiName) {
          return new UE.ui.Button({
            name: uiName,
            title:'插入公式',
            className: 'edui-default edui-for-mathformula edui-icon',
            onclick: function () {
              self.$refs.mathJaxSelector.open(content => {
                if(!content) return;
                editor.execCommand("inserthtml", content)
              });
            }
          })
        })
      },
      initXsfSelector() {
        const self = this;
        UE.registerUI('xsfSelector',function(editor, uiName){
          editor.ready(function() {
            let editDoc = editor.document;
            let handle = function(e) {
              let target = e.target;
              if(target.dataset.tag !== "nkcsource") return;
              let type = target.dataset.type;
              let score = target.dataset.id;
              if(type !== "xsf") return;
              self.$refs.xsfSelector.open(function(newscore) {
                target.dataset.id = newscore;
                target.dataset.message = "浏览这段内容需要"+newscore+"学术分(双击修改)";
              }, parseInt(score));
            };
            let count = 0;
            editDoc.addEventListener("dblclick", handle);
            initDblclick(editDoc, function (e){
              return handle(e);
            });
          });

          return new UE.ui.Button({
            name: uiName,
            title:'学术分隐藏',
            className: 'edui-default edui-for-hide-content edui-icon',
            onclick:function () {
              self.$refs.xsfSelector.open(res => {
                if(!res) return;
                editor.execCommand("inserthtml", resourceToHtml("xsf", res))
              }, {});
            }
          })
        });
      },
      initPlugs() {
        const {plugs = {}, defaultPlugs} = this;
        const _plugs = Object.assign({}, defaultPlugs, plugs);
        if(_plugs.resourceSelector) {
          this.initPlugsResourceSelector();
        }
        if(_plugs.draftSelector) {
          this.initDraftSelector();
        }
        if(_plugs.stickerSelector) {
          this.initStickerSelector();
        }
        if(_plugs.mathJaxSelector) {
          this.initMathJaxSelector();
        }
        if(_plugs.xsfSelector) {
          this.initXsfSelector();
        }
      },
    },
  }
</script>
