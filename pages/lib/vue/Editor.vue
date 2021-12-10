<template lang="pug">
  .editor
    .bg-danger.text-danger.p-a-1.text-center(v-if="errorInfo") 编辑器初始化失败： {{errorInfo}}
    div(v-else)
      resource-selector(ref="resourceSelector")
      div(:id="domId")
</template>

<style lang="less" scoped>
  .editor{
    background-color: #f4f4f4;
  }
</style>

<script>
  import '../../../pages/ueditor/ueditor.less';
  import '../../../pages/ueditor/ueditor.config';
  import '../../../pages/ueditor/ueditor.all.js';
  import {getUrl} from "../js/tools";
  import {getSocket} from "../js/socket";
  import ResourceSelector from './ResourceSelector';
  export default {
    props: ['configs'],
    components: {
      'resource-selector': ResourceSelector
    },
    data: () => ({
      domId: '',
      errorInfo: '',
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
            'insertcode'
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
        wordCount: false, // 是否开启字数统计
        maximumWords: 100, // 最大字符数
        zIndex: 499
      },
    }),
    async mounted () {
      try{
        await this.initDomId();
        await this.initEditor();
        await this.initSocketEvent();
        this.$refs.resourceSelector.open();
      } catch(err) {
        console.log(err);
        this.errorInfo = err.error || err.message || err.toString();
      }

    },
    methods: {
      initDomId() {
        if(this.domId) return;
        this.domId = `editor_id_${Date.now()}_${Math.round(Math.random() * 100000)}`;
      },
      initEditor() {
        const self = this;
        return new Promise((resolve, reject) => {
          const {domId, defaultConfigs, configs = {}} = self;
          self.editor = UE.getEditor(domId, Object.assign(defaultConfigs, configs));
          self.editor.ready(resolve);
        });
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
      getContent() {
        this.editor.getContent();
      }
    },
    destroyed() {
      if(this.editor && this.editor.destroy) {
        this.editor.destroy();
      }
    }
  }
</script>