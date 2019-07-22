const svgCaptcha = require('svg-captcha');
class captcha {
  static createMath(options) {
    return svgCaptcha.createMathExpr(options);
  }

  static create(options) {
    return svgCaptcha.create(options);
  }

  static createRegisterCode() {
    return this.createMath({
      size: 8,
      ignoreChars: '0o1IilL',
      noise: 5,
      color: true,
      background: "#cc9966"
    });
  }
}

module.exports = captcha;
