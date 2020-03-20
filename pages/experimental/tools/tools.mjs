var CommonModal = new NKC.modules.CommonModal();

new Vue({
  el: "#app",
  data: {
    selected: false
  },
  methods: {
    editTool: function(version, name, summary, uid, author, entry, isOtherSite, id) {
      CommonModal.open(function(form) {
        console.log(form);
        let formData = new FormData();
        form.forEach(d => {
          formData.append(d.name, d.value);
        })
        formData.append("_id", id);
        nkcUploadFile("/tools/update", "post", formData, (e, percent) => {
          console.log(percent)
        })
        .then(() => asyncSweetSuccess("修改成功", {autoHide: false}))
        .then(() => location.reload())
        .catch(asyncSweetError);
        CommonModal.close();
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
            dom: "input",
            label: "入口文件",
            name: "entry",
            value: entry,
            placeholder: "必填，默认/index.html"
          },
          {
            dom: "radio",
            label: "是否是站外站点",
            value: isOtherSite,
            name: "isOtherSite",
            radios: [
              {name: "是", value: true},
              {name: "否", value: false}
            ]
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
    },
    deleteTool: function(id, toolname) {
      sweetConfirm(`确定要删除 ${toolname} 吗？`)
      .then(() => nkcAPI("/tools/delete?_id=" + id, "DELETE"))
      .then(() => asyncSweetSuccess("删除成功", {autoHide: false}))
      .then(() => location.reload())
      .catch(asyncSweetError);
    },
    addTool: function() {
      CommonModal.open(function(form){
        console.log(form);
        let formData = new FormData();
        form.forEach(d => {
          formData.append(d.name, d.value);
        })
        nkcUploadFile("/tools/upload", "post", formData, (e, percent) => {
          console.log(percent)
        })
        .then(() => asyncSweetSuccess("上传成功", {autoHide: false}))
        .then(() => location.reload())
        .catch(asyncSweetError);
        CommonModal.close();
      }, {
        title: '上传工具',
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
            dom: "input",
            label: "入口文件",
            name: "entry",
            value: "",
            placeholder: "必填，默认/index.html"
          },
          {
            dom: "radio",
            label: "是否是站外站点",
            value: false,
            name: "isOtherSite",
            radios: [
              {name: "是", value: true},
              {name: "否", value: false}
            ]
          },
          {
            dom: "input",
            label: "工具压缩包",
            type: "file",
            name: "file",
            accept: ".zip"
          }
        ]
      })
    }
  }
})