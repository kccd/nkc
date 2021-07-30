$(function() {
  Swal({
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    text: "需要重新验证手机号，否则发表的新内容将进入审核流程",
    showCancelButton: true,
    reverseButtons: true,
    allowClickOutside: false
  })
  .then(function(result) {
    if(result.value) {
      localStorage.setItem("need_verify_phone_number", "1;" + new Date().toString())
      location.href = "/u/"+ NKC.configs.uid +"/settings/security";
    }
  });
});