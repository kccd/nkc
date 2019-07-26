var NKC = {
  methods: {},
  modules: {},
  configs: {}
};

function sweetAlert(text) {
  text = (text.error || text) + "";
  Swal({
    confirmButtonText: "关闭",
    text: text
  });
}

function sweetSuccess(text) {
  text = text + "";
  Swal({
    type: "success",
    confirmButtonText: "关闭",
    text: text
  });
}
function sweetError(text) {
  text = text.error || text;
  text = text + "";
  Swal({
    type: "error",
    confirmButtonText: "关闭",
    text: text.error || text
  });
}
function sweetInfo(text) {
  text = text + "";
  Swal({
    type: "info",
    confirmButtonText: "关闭",
    text: text
  });
}
function sweetWarning(text) {
  text = text + "";
  Swal({
    type: "warning",
    confirmButtonText: "关闭",
    text: text
  });
}
function sweetConfirm(text) {
  text = text + "";
  return new Promise(function(resolve, reject) {
    Swal({
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      text: text,
      showCancelButton: true,
      reverseButtons: true
    })
      .then(function(result) {
        if(result.value === true) {
          resolve();
        }
      })
  });
}
function sweetQuestion(text) {
  text = text + "";
  return new Promise(function(resolve, reject) {
    Swal({
      type: "question",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      text: text,
      showCancelButton: true,
      reverseButtons: true
    })
      .then(function(result) {
        if(result.value === true) {
          resolve();
        }
      })
  });
}


/*
* 打开链接 兼容APP
* @param {String} url 链接
* @param {Boolean} blank 是否在后台打开
* @author pengxiguaa 2019-7-26
* */

NKC.methods.visitUrl = function(url, blank) {
  if(localStorage.getItem("apptype") === "app") {
    if(window.appOpenUrl) {
      window.appOpenUrl(url);
    }
  } else {
    if(blank) {
      window.open(url);
    } else {
      window.location.href = url;
    }
  }
};
