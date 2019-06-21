function switchChildren(fid, e) {
  var forumBlockChildren = $(".forum-block-children[data-fid='"+fid+"']");
  forumBlockChildren.slideToggle();
  var fa = $(e);
  if(fa.hasClass("fa-angle-down")) {
    fa.removeClass("fa-angle-down");
    fa.addClass("fa-angle-up");
  } else {
    fa.removeClass("fa-angle-up");
    fa.addClass("fa-angle-down");
  }
}