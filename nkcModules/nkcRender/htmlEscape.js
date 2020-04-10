module.exports = {
  htmlEscape: (html) => {
    return html.replace(/[<>&]/g, source => {
      if(source === "<") return "&lt;";
      if(source === ">") return "&gt;";
      if(source === "&") return "&amp;";
    })
  },
  reduceHtml: (html) => {
    return html.replace(/(&lt;)|(&gt;)|(&amp;)/g, source => {
      if(source === "&lt;") return "<";
      if(source === "&gt;") return ">";
      if(source === "&amp;") return "&";
    });
  }
};