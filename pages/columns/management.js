// 封禁专栏
function disabledColumn(columnId, type, index) {
  CommonModal.open(function() {
    if(!confirm("确定要执行该操作？")) return;
    nkcAPI("/m/" + columnId + "/disabled", "POST", {
      type: type,
      index: index
    })
      .then(function() {
        screenTopAlert("操作成功");
      })
      .catch(function(data) {
        screenTopWarning(data);
      })
  }, {
      title: "专栏",
    data: [
      {
        _id: "reason",
        dom: "textarea",
        rows: 5,
        label: "请输入屏蔽原因：",
        value: "",
        type: "text",
        placeholder: ""
      }
    ]
  });
}

function managementColumn(columnId, type, disabled) {
  var method = "POST";
  var url = "/m/" + columnId + "/disabled";
  var body = {
    type: type,
    disabled: disabled
  };
  if(disabled) {
    CommonModal.open(function(data) {
      if(!data[0].value) return screenTopWarning("请填写屏蔽原因");
      body.reason = data[0].value;
      nkcAPI(url, method, body)
        .then(function() {
          CommonModal.close();
          screenTopAlert("操作成功");
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    }, {
      title: "专栏",
      data:[
        {
          _id: "reason",
          dom: "textarea",
          rows: 5,
          label: "请输入屏蔽原因：",
          value: "",
          type: "text",
          placeholder: ""
        }
      ]
    });
  } else {
    nkcAPI(url, method, body)
      .then(function() {
        screenTopAlert("操作成功");
      })
      .catch(function(data) {
        screenTopWarning(data);
      })
  }
}