"use strict";

(function () {
  var d = $(document);

  var modifyCSS = function modifyCSS() {
    var distance = d.scrollTop();
    var dom;

    if (distance > 800) {
      dom = $("#moduleToTop");
      dom.css({
        right: "2rem",
        opacity: 1
      });
    } else {
      dom = $("#moduleToTop");
      dom.css({
        right: "-4rem",
        opacity: 0
      });
    }
  };

  window.addEventListener("scroll", function () {
    modifyCSS();
  });
  modifyCSS();
})();