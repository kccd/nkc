const { createCanvas } = require('canvas');

class SecretWatermarkService {
  generateWatermarkBase64(text) {
    // 创建画布（建议尺寸与文字倾斜后的可视区域匹配）
    const canvas = createCanvas(200, 100);
    const ctx = canvas.getContext('2d');

    // 设置透明背景
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 设置文字样式（根据需求调整）
    ctx.font = '14px "Microsoft Yahei"'; // 使用系统自带字体
    ctx.fillStyle = 'rgba(128, 128, 128, 0.3)'; // 半透明灰色
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 倾斜文字（-20度）
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((-20 * Math.PI) / 180);
    ctx.fillText(text, 0, 0);

    // 转换为 Base64
    return canvas.toBuffer('image/png');
  }
}

module.exports = {
  secretWatermarkService: new SecretWatermarkService(),
};
