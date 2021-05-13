;(function(){
  if(!NKC) return;
  if(!NKC.methods) return;

  function deletePost(postId) {
    sweetQuestion("你确定要删除吗？")
      .then(() => nkcAPI(`/p/${postId}/delete`, "GET"))
      .then(res => {
        console.log(res);
      })
  };

  NKC.methods.deletePost = deletePost;
}());