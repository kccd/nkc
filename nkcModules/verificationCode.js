// const imgHeight = 40,
//   imgWidth = 300; // 主尺图片高宽
// const fontSize = 10; // 文字大小
// const backgroundColor = '#ddd'; // 背景颜色
// const fontColor = '#000'; // 字体颜色、刻度颜色
// const fontInfo = `${fontSize}px Sans`;
// const paddingLeft = 5; // 主尺刻度距离左边的距离
const { createCanvas } = require('canvas');
// const { isDevelopment } = require('../../settings/env');
// const unit = 'mm';
const codeWidth = 210;
const codeHeight = 40;
const codeRange = 100;
const codeOperate = ['+', '-'];

let num1 = 0;
let num2 = 0;
let symbol = '+';
let result = 0; // 计算结果
// let inputValue = '';
// let state = 'active'; // 验证 成功 失败
function create() {
  // 主尺刻度范围 最小值在0到50，最大值在最小值的基础上增加30到35
  //   const minNumber = Math.round(Math.random() * 50);
  //   const maxNumber = minNumber + Math.round(Math.random() * 5 + 30);

  //   // 副尺刻度范围 最小值在-9到0，最大值在10到18
  //   const minNumber2 = -1 * Math.round(Math.random() * 9);
  //   const maxNumber2 = Math.round(Math.random() * 8 + 10);

  //   // 主尺刻度数量
  //   const numberCount = maxNumber - minNumber;

  //   // 主尺刻度范围高宽
  //   const codeHeight = imgHeight;
  //   const codeWidth = imgWidth - 10;

  //   // 主尺单位 像素宽度
  //   const unitWidth = codeWidth / (numberCount + 3);

  //   // 副尺刻度宽度
  //   const width2 = unitWidth * 9 + 20;

  //   // 副尺单位 像素宽度
  //   const unitWidth2 = (unitWidth * 9) / 10;

  //   // 副尺刻度距离左边的距离
  //   const paddingLeft2 = Math.round(Math.random() * (imgWidth - width2));

  // 主尺、副尺画布
  const canvas = createCanvas(210, 40);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = randomColor(180, 240);
  ctx.fillRect(0, 0, codeWidth, codeHeight);
  // 绘制干扰线
  for (let j = 0; j < 3; j++) {
    ctx.strokeStyle = randomColor(40, 180);
    ctx.beginPath();
    ctx.moveTo(randomNum(0, codeWidth), randomNum(0, codeHeight));
    ctx.lineTo(randomNum(0, codeWidth), randomNum(0, codeHeight));
    ctx.stroke();
  }
  // 绘制干扰点
  for (let k = 0; k < 30; k++) {
    ctx.fillStyle = randomColor(0, 255);
    ctx.beginPath();
    ctx.arc(
      randomNum(0, codeWidth),
      randomNum(0, codeHeight),
      1,
      0,
      2 * Math.PI,
    );
    ctx.fill();
  }
  let formula = ''; // 公式字符串
  num1 = Math.floor(Math.random() * codeRange);
  num2 = Math.floor(Math.random() * codeRange);
  symbol = codeOperate[Math.floor(Math.random() * 2)];
  // console.log(num1, num2, symbol);
  if (symbol === '+') {
    formula = `${num1}+${num2}=?`;
    result = num1 + num2;
  } else {
    if (num1 >= num2) {
      formula = `${num1}-${num2}=?`;
    } else {
      formula = `${num2}-${num1}=?`;
    }
    result = Math.abs(num1 - num2);
  }
  console.log(formula, result);
  // 缓存 redis id
  for (let i = 0; i < formula.length; i++) {
    // 随机生成字体颜色
    ctx.fillStyle = randomColor(50, 160);
    // 随机生成字体大小(0.5 - 0.75)高的范围
    ctx.font =
      randomNum((codeHeight * 2) / 4, (codeHeight * 3) / 4) + 'px SimHei';
    // 字体对齐位置
    ctx.textBaseline = 'top';

    let x = 20 + i * (codeWidth / formula.length);
    let y = randomNum(5, codeHeight / 4);
    ctx.fillText(formula[i], x, y);
  }

  return {
    // question,
    // answer,
    // backgroundColor,
    mainImageBase64: canvas.toDataURL(),
  };
}

// function verify(data, dataDB) {
//   if (isDevelopment) {
//     console.log(`上传：${data.answer}px 精准：${dataDB.answer}px`);
//   }
//   return data.answer <= dataDB.answer + 1 && data.answer >= dataDB.answer - 1;
// }

// function getQuestion(options) {
//   const { maxNumber, minNumber, unitWidth, paddingLeft2 } = options;
//   // 目标值
//   let question =
//     Math.random() * (maxNumber - 15 - minNumber - 4) + minNumber + 4;

//   const answer = Number(
//     ((question - minNumber) * unitWidth - paddingLeft2).toFixed(1),
//   );

//   if (answer >= -3 && answer <= 3) {
//     return getQuestion(options);
//   } else {
//     return {
//       question: question.toFixed(1) + unit,
//       answer,
//     };
//   }
// }

function randomColor(min, max) {
  let r = randomNum(min, max);
  let g = randomNum(min, max);
  let b = randomNum(min, max);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
module.exports = {
  create,
  //   verify,
};
