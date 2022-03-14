$(document).ready(function(){
  new Promise(function(resolve, reject) {
    if(NKC.configs.isApp) {
      setTimeout(function() {
        resolve();
      }, 300)
    } else {
      resolve();
    }
  })
    .then(function() {
      if(NKC.methods.autoHideCommentContent) {
        // 内容折叠
        NKC.methods.autoHideCommentContent();
      }
    })
    .catch(function(data) {
      console.error(data);
    });
})


