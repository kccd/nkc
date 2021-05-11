window.subscribeForum = (sub, fid) => {
  if(!window.SubscribeTypes) {
    window.SubscribeTypes = new NKC.modules.SubscribeTypes();
  }
  window.SubscribeTypes.subscribeForumPromise(fid, sub)
    .then(() => {
      if(sub) {
        // 关注成功
        subscribed(fid);
      } else {
        // 取关成功
        unSubscribed(fid);
      }
    })
    .catch(sweetError);
};

function subscribed(fid) {
  const button = $(`div[data-button-fid='${fid}']`);
  const number = $(`div[data-number-fid='${fid}']`);
  button.addClass("cancel").attr("onclick", `subscribeForum(false, '${fid}')`).text("取关");
  number.text(Number(number.eq(0).text() || 0) + 1);
  number.addClass("show");
  setTimeout(() => {
    number.addClass("move");
    setTimeout(() => {
      number.removeClass("show").removeClass("move");
    }, 2000);
  }, 500)
}
function unSubscribed(fid) {
  const button = $(`div[data-button-fid='${fid}']`);
  const number = $(`div[data-number-fid='${fid}']`);
  button.removeClass("cancel").attr("onclick", `subscribeForum(true, '${fid}')`).text("关注");
  const num = Number(number.eq(0).text() || 0);
  number.text(num? num - 1: num);
}

Object.assign(window, {
  subscribed,
  unSubscribed,
});

