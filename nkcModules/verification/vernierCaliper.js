const imgHeight = 40, imgWidth = 300; // 主尺图片高宽
const fontSize = 10; // 文字大小
const backgroundColor = '#ddd'; // 背景颜色
const fontColor = '#000'; // 字体颜色、刻度颜色
const fontInfo = `${fontSize}px Sans`;
const paddingLeft = 5; // 主尺刻度距离左边的距离
const {createCanvas, loadImage} = require('canvas');
const unit = 'mm';
function create() {
  // 主尺刻度范围 最小值在0到50，最大值在最小值的基础上增加30到35
  const minNumber = Math.round(Math.random() * 50);
  const maxNumber = minNumber + Math.round(Math.random() * 5 + 30);

  // 副尺刻度范围 最小值在-9到0，最大值在10到18
  const minNumber2 = -1 * Math.round(Math.random() * 9);
  const maxNumber2 = Math.round(Math.random() * 8 + 10);

  // 主尺刻度数量
  const numberCount = maxNumber - minNumber;

  // 主尺刻度范围高宽
  const height = imgHeight;
  const width = imgWidth - 10;

  // 主尺单位 像素宽度
  const unitWidth = width / (numberCount + 3);

  // 副尺刻度宽度
  const width2 = unitWidth * 9 + 20;

  // 副尺单位 像素宽度
  const unitWidth2 = unitWidth * 9 / 10;

  // 副尺刻度距离左边的距离
  const paddingLeft2 = Math.round(Math.random() * (imgWidth - width2));

  // 主尺、副尺画布
  const canvas = createCanvas(imgWidth, imgHeight);
  const canvas2 = createCanvas(imgWidth, imgHeight);
  const ctx = canvas.getContext('2d');
  const ctx2 = canvas2.getContext('2d');

  ctx.fillStyle = backgroundColor;
  ctx2.fillStyle = backgroundColor;

  // 渲染背景
  ctx.fillRect(0, 0, imgWidth, imgHeight)
  // 向右移动一点点画布，避免第一个刻度与图片左边框重合导致看不清刻度的问题
  ctx.translate(paddingLeft, 0);

  // 画主尺 ---------------------------

  let showUnit = false; // 是否已显示过刻度单位

  for(let i = 0; i <= numberCount; i ++) {
    const x = i * unitWidth;
    let lineHeight = 8; // 默认刻度高度
    let number = i + minNumber; // 实际刻度值需要当前值加上最小刻度值
    let numberStr; // 显示的刻度信息
    if(number % 5 === 0) {
      lineHeight = 11;
      if(number % 10 === 0) {
        lineHeight = 14;
        numberStr = number;
        if(!showUnit) { // 第一个刻度数字显示单位
          showUnit = true;
          numberStr += unit;
        }
      }
    }
    ctx.fillStyle = fontColor;
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.lineTo(x, height - lineHeight); // 画刻度
    if(numberStr) {
      ctx.font = fontInfo;
      ctx.fillText(numberStr, x, fontSize + 10);
    }
    ctx.stroke();
  }

  // 画副尺 同上-----------------------------------
  ctx2.fillRect(0, 0, imgWidth, imgHeight)

  ctx2.translate(paddingLeft2 + paddingLeft, 0);
  for(let i = minNumber2; i <= maxNumber2; i++) {
    const x = i * unitWidth2;
    let lineHeight = 8;
    let showNumber = false;
    if(i % 5 === 0) {
      lineHeight = 11;
      if(i % 10 === 0) {
        lineHeight = 14;
        showNumber = true;
      }
    }
    ctx2.beginPath();
    ctx2.fillStyle = fontColor;
    ctx2.moveTo(x, 0);
    ctx2.lineTo(x, lineHeight);
    if(showNumber) {
      ctx2.font = fontInfo;
      ctx2.fillText(i, x, fontSize + lineHeight);
    }
    ctx2.stroke();
  }

  // 目标值
  let question = Math.random() * (maxNumber - 15 - minNumber - 15) + minNumber + 15;

  const answer = Number(((question - minNumber) * unitWidth - paddingLeft2).toFixed(1));

  question = question.toFixed(1) + unit;

  return {
    question,
    answer,
    backgroundColor,
    mainImageBase64: canvas.toDataURL(),
    secondaryImageBase64: canvas2.toDataURL(),
  }
}

function verify(data, dataDB) {
  console.log(data.answer, dataDB.answer);
  return data.answer <= dataDB.answer + 1 && data.answer >= dataDB.answer - 1
}

module.exports = {
  create, verify
};

