const svgCaptcha = require('svg-captcha');
class captcha {
  static createMath(options) {
    return svgCaptcha.createMathExpr(options);
  }

  static create(options) {
    return svgCaptcha.create(options);
  }

  static createRegisterCode() {
    return this.create({
      size: 4,
      ignoreChars: '0oO1IilL',
      noise: 5,
      color: true,
      background: "#fff"
    });
  }
}

module.exports = captcha;
