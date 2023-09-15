const { createCanvas } = require('canvas');
const codeWidth = 220;
const codeHeight = 40;
const codeRange = 10;
const codeOperate = ['+', '-'];

let num1 = 0;
let num2 = 0;
let symbol = '+';
let result = 0; // 计算结果
function create() {
  const canvas = createCanvas(codeWidth, codeHeight);
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
  // console.log(formula, result);
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
    question: formula,
    answer: result,
    // backgroundColor,
    mainImageBase64: canvas.toDataURL(),
  };
}
// 验证结果
function verify(data, dataDB) {
  return Number(data.answer) === Number(dataDB.answer);
}

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
  verify,
};
