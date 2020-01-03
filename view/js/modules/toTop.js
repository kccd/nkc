(() => {
  const d = $(document);
  const modifyCSS = () => {
    const distance = d.scrollTop();
    let dom;
    if(distance > 800) {
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
  window.addEventListener("scroll", () => {
    modifyCSS();
  });
  modifyCSS();
})();
