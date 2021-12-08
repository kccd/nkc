export function sweetAlert(text) {
  text = (text.error || text) + "";
  return Swal({
    confirmButtonText: "关闭",
    text: text
  })
}

export function sweetPrompt(title, content = '') {
  return new Promise(resolve => {
    Swal.fire({
      title,
      input: 'textarea',
      inputAttributes: {
        autocapitalize: 'off',
      },
      inputValue: content,
      allowOutsideClick: true,
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      showLoaderOnConfirm: true,
      preConfirm: (text) => {
        resolve(text);
      }
    });
  });
}

export function sweetSuccess(text, options) {
  options = options || {
    autoHide: true,
    timer: 2000
  };
  text = text + "";
  if(options.autoHide) {
    return Swal({
      type: "success",
      confirmButtonText: "关闭",
      timer: options.timer,
      text: text
    });
  } else {
    return Swal({
      type: "success",
      confirmButtonText: "关闭",
      text: text
    });
  }
}

export function sweetError(text) {
  console.log(text);
  text = text.error || text.message || text;
  text = text + "";
  return Swal({
    type: "error",
    confirmButtonText: "关闭",
    text: text.error || text
  });
}

export function sweetInfo(text) {
  text = text + "";
  Swal({
    type: "info",
    confirmButtonText: "关闭",
    text: text
  });
}

export function sweetWarning(text) {
  text = text + "";
  Swal({
    type: "warning",
    confirmButtonText: "关闭",
    text: text
  });
}

export function sweetConfirm(text) {
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

export function sweetQuestion(text) {
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

// html内容弹窗
export function asyncSweetCustom(html) {
  return Swal({
    confirmButtonText: "关闭",
    html: html || ""
  });
}

// promise版本弹框
export function asyncSweetSuccess(text, options) {
  return new Promise(function(resolve, reject) {
    options = options || {
      autoHide: true,
      timer: 2000
    };
    text = text + "";
    if(options.autoHide) {
      return Swal({
        type: "success",
        confirmButtonText: "关闭",
        timer: options.timer,
        text: text
      }).then(function() {
        resolve()
      });
    } else {
      return Swal({
        type: "success",
        confirmButtonText: "关闭",
        text: text
      }).then(function(){
        resolve()
      });
    }
  })
}

export function asyncSweetError(text) {
  return new Promise(function(resolve, reject) {
    text = text.error || text;
    text = text + "";
    return Swal({
      type: "error",
      confirmButtonText: "关闭",
      text: text.error || text
    }).then(function() {
      resolve();
    });
  });
}