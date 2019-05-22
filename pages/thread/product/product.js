/**
 * 展开剩余的摘要
 */
function showAbstract() {
  $(".showAbstract").css("display", "none");
  $(".hideAbstract").css("display", "");
  $("#showText").css("display", "none")
  $("#hideText").css("display", "")
}

/**
 * 收起剩余摘要
 */
function hideAbstract() {
  $(".showAbstract").css("display", "");
  $(".hideAbstract").css("display", "none");
  $("#showText").css("display", "")
  $("#hideText").css("display", "none")
}

/**
 * 展开剩余的关键字
 */
function showKeywords() {
  $(".showKeywords").css("display", "none");
  $(".hideKeywords").css("display", "");
  $("#showWords").css("display", "none")
  $("#hideWords").css("display", "")
}

/**
 * 收起剩余关键字
 */
function hideKeywords() {
  $(".showKeywords").css("display", "");
  $(".hideKeywords").css("display", "none");
  $("#showWords").css("display", "")
  $("#hideWords").css("display", "none")
}