var CommonModal = new NKC.modules.CommonModal();

new Vue({
  el: "#app",
  data: {
    selected: false,
  },
  methods: {
    setStyle(link, dom, dom1){
      if(link){
        const t = dom.text().trim();
        if(t === '工具压缩包') dom.hide();
        const t1 = dom1.text().trim();
        if(t1 === '入口文件') {
          dom1.children('h5').text('链接');
          dom1.children('input').attr('placeholder', '请输入链接');
        }
        }else{
          const t = dom.text().trim();
          if(t === '工具压缩包') dom.show();
          const t1 = dom1.text().trim();
          if(t1 === '链接') {
            dom1.children('h5').text('入口文件');
            dom1.children('input').attr('placeholder', '默认/index.html');
          }
        }
    },
    selectLink(){
      // radio公共的父级dom
      const radio = $("#moduleCommonModalApp div[class=radio]");
      // 链接 第一个为true的radio
      const select = $("#moduleCommonModalApp div[class=radio] input[value=true]")[0];
      // 工具压缩包
      const dom = $('#moduleCommonModalApp div[class=form-group]:last');
      // 入口文件
      const dom1 = dom.prev();
      if(!radio[0] || !select || !dom[0] || !dom1[0]) {
        asyncSweetSuccess('缺少必要的dom');
        return;
      }
      if(select){
          this.setStyle(select.checked, dom, dom1);
      }
      radio[0].onclick = ({ target }) => {
        let link = (select && select.checked) || false;
        if(target.type === 'radio' && target.value === "true" ) link = true;
        if(target.type === 'radio' && target.value === "false") link = false;
        this.setStyle(link, dom, dom1);
      }
    },
    editTool: function(version, name, summary, uid, author, entry, isOtherSite, id) {
      CommonModal.open(function(form) {
        let formData = new FormData();
        form.forEach(d => {
          formData.append(d.name, d.value);
        });
        formData.append("_id", id);
        nkcUploadFile("/tools/update", "post", formData, (e, percent) => {
          // console.log(percent)
        })
        .then(() => {
          asyncSweetSuccess("修改成功", {autoHide: false});
          CommonModal.close();
        })
        .then(() => location.reload())
        .catch(asyncSweetError);
      }, {
        title: '修改工具信息',
        data: [
          {
            dom: 'input',
            label: "版本号",
            name: "version",
            value: version,
            placeholder: "1.0"
          },
          {
            dom: "input",
            label: "工具名",
            name: "name",
            value: name,
            placeholder: "必填"
          },
          {
            dom: "input",
            label: "简介",
            name: "summary",
            value: summary,
            placeholder: "可缺省"
          },
          {
            dom: "input",
            label: "作者",
            name: "author",
            value: author,
            placeholder: "缺省显示为[匿名]"
          },
          {
            dom: "input",
            label: "作者uid",
            name: "uid",
            value: uid,
            placeholder: "可缺省"
          },
          {
            dom: "radio",
            label: "链接",
            value: isOtherSite,
            name: "isOtherSite",
            radios: [
              {name: "是", value: true},
              {name: "否", value: false}
            ]
          },
          {
            dom: "input",
            label: "入口文件",
            name: "entry",
            value: entry,
            placeholder: "必填，默认/index.html"
          },
          {
            dom: "input",
            label: "工具压缩包",
            type: "file",
            name: "file",
            accept: ".zip"
          }
        ],
      });
      this.$nextTick(() => {
        this.selectLink();
      })
    },
    deleteTool: function(id, toolname) {
      sweetConfirm(`确定要删除 ${toolname} 吗？（此操作不可恢复）`)
      .then(() => nkcAPI("/tools/delete?_id=" + id, "DELETE"))
      .then(() => asyncSweetSuccess("删除成功", {autoHide: false}))
      .then(() => location.reload())
      .catch(asyncSweetError);
    },
    addTool: function() {
      CommonModal.open(function(form){
        if(form[5].value){
          const reg = /^http(s)?:\/\/.+/;
          if(!reg.test(form[6].value)){
            asyncSweetError("请输入正确的链接");
            return;
          }
        }
        let formData = new FormData();
        form.forEach(d => {
          formData.append(d.name, d.value);
        });
        nkcUploadFile("/tools/upload", "post", formData, (e, percent) => {
          console.log(percent)
        })
        .then(() => {
          asyncSweetSuccess("上传成功", {autoHide: false});
          CommonModal.close();
        })
        .then(() => location.reload())
        .catch(asyncSweetError);
      }, {
        title: '上传工具',
        // 如果label改变，请改变setStyle方法中对应的dom内容
        data: [
          {
            dom: 'input',
            label: "版本号",
            name: "version",
            value: "",
            placeholder: "1.0"
          },
          {
            dom: "input",
            label: "工具名",
            name: "name",
            value: "",
            placeholder: "必填"
          },
          {
            dom: "input",
            label: "简介",
            name: "summary",
            value: "",
            placeholder: "可缺省"
          },
          {
            dom: "input",
            label: "作者",
            name: "author",
            value: "",
            placeholder: "缺省显示为[匿名]"
          },
          {
            dom: "input",
            label: "作者uid",
            name: "uid",
            value: "",
            placeholder: "可缺省"
          },
          {
            dom: "radio",
            label: "链接",
            value: false,
            name: "isOtherSite",
            radios: [
              {name: "是", value: true},
              {name: "否", value: false}
            ]
          },
          {
            dom: "input",
            label: "入口文件",
            name: "entry",
            value: "",
            placeholder: "默认/index.html"
          },
    
          {
            dom: "input",
            label: "工具压缩包",
            type: "file",
            name: "file",
            accept: ".zip"
          }
        ]
      });
      this.$nextTick(() => {
        this.selectLink();
      })
    },
    hideTool: function(id, toolname, isHide) {
      sweetConfirm(isHide? `要解除屏蔽 ${toolname} 吗？`:`确定要屏蔽 ${toolname} 吗？（可以随时解除屏蔽）`)
      .then(() => nkcAPI("/tools/hide?_id=" + id, "DELETE"))
      .then(() => asyncSweetSuccess(isHide? "已解除":"已屏蔽", {autoHide: false}))
      .then(() => location.reload())
      .catch(asyncSweetError);
    },
    enableSiteTool: function() {
      nkcAPI("/tools/enableSiteTools", "POST")
        .then(data => asyncSweetSuccess(data.message, {autoHide: false}))
        .then(() => location.reload())
        .catch(asyncSweetError);
    }
  }
});

window.CommonModal = CommonModal;
