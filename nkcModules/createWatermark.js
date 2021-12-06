const {createCanvas, loadImage} = require('canvas');
module.exports = async (imagePath, text = '', transparent = 1) => {
  // 输出的水印图片高度为100px
  const canvasPadding = 0;
  const logo = await loadImage(imagePath);
  const logoHeight = logo.height;
  const canvas = createCanvas(logo.width, logoHeight + 2 * canvasPadding);
  const ctx = canvas.getContext('2d');
  const logoWidth = logoHeight * logo.width / logo.height;

  const fontInfo = `${logoHeight}px Noto Sans S Chinese Medium`;
  ctx.font = fontInfo;
  const textSize = ctx.measureText(text);
  const gap = text? logoHeight / 6: 0;
  canvas.width = textSize.width + logoWidth + gap + 2 * canvasPadding;
  // ctx.globalAlpha = transparent;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.shadowBlur = 2;
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.fillStyle = '#ffffff';
  ctx.font = fontInfo;
  ctx.textBaseline = 'middle';
  ctx.drawImage(logo, canvasPadding, canvasPadding, logoWidth, logoHeight);
  ctx.fillText(text, canvasPadding + logoWidth + gap, logoHeight / 2 + canvasPadding);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for(let i = 0, len = imgData.data.length; i < len; i += 4) {
    imgData.data[i + 3] = imgData.data[i + 3] * transparent
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.createPNGStream();
};
