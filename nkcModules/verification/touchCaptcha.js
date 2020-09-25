const fs = require('fs')
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// 文字库
const chineseChars = "天地玄黄宇宙洪荒日月昃辰宿列张遐迩宾归王鸣凤在竹白驹食场容止若思安定".split("");

// 预选位置
const predefinePosition = [
  {x: 250, y: 100},
  {x: 250, y: 400},
  {x: 100, y: 250},
  {x: 400, y: 250},
  {x: 100, y: 100},
  {x: 400, y: 100},
  {x: 100, y: 400},
  {x: 400, y: 400},
  {x: 250, y: 250}
];

/**
 * 绘制一个验证图
 * 返回正确文字的位置信息和canvas对象
 */
async function makeCaptchaImage(){
  const canvas = createCanvas(500, 500);
  const ctx = canvas.getContext('2d');

  // 绘制背景图
  let backgroundImagePath = await getRandomBackgroundImage();
  const image = await loadImage(backgroundImagePath);
  ctx.drawImage(image, 0, 0, 500, 500)

  // 总共绘制6个文字，3个正确文字
  // 随机选取6个文字并绘制
  // 洗牌
  shuffleArray(chineseChars);
  // 随机选取6个位置
  shuffleArray(predefinePosition);
  let positions = predefinePosition.slice(0, 6);
  // 取前6个
  let textInfoList = chineseChars.slice(0, 6).map(char => {
    let position = positions.shift();
    return drawText({
      ctx,
      textCenterX: position.x,
      textCenterY: position.y,
      rotate: randomIn(70, -70),
      text: char
    })
  });

  // 整体效果
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  // 生成随机噪点像素
  for (var i = 0; i < data.length; i += 4) {
    // 噪点密度控制
    if(Math.random() > 0.08) continue;
    // 随机灰度噪点
    let grayscale = Math.floor(Math.random() * (255 - 0) + 0);
    data[i]     = grayscale; // red
    data[i + 1] = grayscale; // green
    data[i + 2] = grayscale; // blue
    i += 4;
    data[i]     = grayscale; // red
    data[i + 1] = grayscale; // green
    data[i + 2] = grayscale; // blue
    i += 4;
    data[i]     = grayscale; // red
    data[i + 1] = grayscale; // green
    data[i + 2] = grayscale; // blue
    i += 4;
    data[i]     = grayscale; // red
    data[i + 1] = grayscale; // green
    data[i + 2] = grayscale; // blue
  }
  ctx.putImageData(imageData, 0, 0);

  if(!global.NKC) {
    let captchaTempImagePath = path.resolve(__dirname, "../../tmp/captcha.png");
    const out = fs.createWriteStream(captchaTempImagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out)
    out.on('finish', () =>  console.log('The PNG file was created.'));
  }

  let answerSet = textInfoList.slice(0, 3);
  canvas.height
  return {
    answer: answerSet,
    question: answerSet.map(ans => ans.text),
    image: {
      base64: canvas.toDataURL(),
      width: canvas.width,
      height: canvas.height
    }
  };
}

// 验证点击位置
function verify(captchaInfo, userPoints) {
  // 计算用户点击点是否依次点击在了规定范围内
  for(let index in captchaInfo) {
    let {centerPoint, radius} = captchaInfo[index];
    let point = userPoints[index];
    let {abs, sqrt, pow} = Math;
    let distance = pow(sqrt(abs(centerPoint.x - point.x)) + sqrt(abs(centerPoint.y - point.y)), 2);
    if(distance === 0) return false;
    if(distance > radius) return false; 
  }
  return true;
}


// 获取范围内的随机数
function randomIn(max, min) {
  return Math.floor(Math.random() * (max - min) + min);
}


// 数组洗牌
function shuffleArray(arr) {
  let len = arr.length;
  for(let index in arr) {
    let randomIndex = randomIn(len - 1, 0);
    let elem = arr[index];
    let targetElem = arr[randomIndex];
    arr[randomIndex] = elem;
    arr[index] = targetElem;
  }
  return arr;
}


// 求圆上任意一点的坐标
// 圆心坐标、半径、角度
function ac({x,y}, r, angle) {
  return {
    x: x + r * Math.cos(angle * Math.PI/180),
    y: y + r * Math.sin(angle * Math.PI/180)
  }
}


// 绘制文字
function drawText({
  ctx,
  textCenterX = 0,
  textCenterY = 0,
  rotate = 0,
  text = "字"
}) {
  ctx.save();

  // 移动画布圆心到图片中心点
  ctx.translate(textCenterX, textCenterY);

  // 旋转画布
  ctx.rotate(rotate * Math.PI/180);

  // 画文字
  ctx.font = "bold 68px Sans";
  let metrics = ctx.measureText(text);
  let textBackgroundW = metrics.width;
  let textBacjgroundH = 68;
  let textX = -(textBackgroundW / 2);
  let textY = -(textBacjgroundH / 2);
  ctx.fillStyle = "#e0e0e0";
  ctx.textBaseline = "hanging";
  ctx.fillText(text, textX, textY);
  ctx.strokeStyle = "#666";
  ctx.strokeText(text, textX, textY);

  ctx.restore();

  return {
    // 文字的中心点
    centerPoint: {
      x: textCenterX,
      y: textCenterY
    },
    // 文字的最大半径
    radius: Math.sqrt(Math.pow(68 / 2, 2) + Math.pow(textBackgroundW / 2, 2)),
    text
  }
}


// 给定圆心和半径绘制圆形标记
function markRound(info, ctx) {
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "red";
  let centerPoint = info.centerPoint;
  let init = ac({x: centerPoint.x, y: centerPoint.y}, info.radius, 0);
  ctx.moveTo(init.x, init.y);
  for(let i = 0; i <= 360; i++) {
    let nextPoint = ac({x: centerPoint.x, y: centerPoint.y}, info.radius, i);
    ctx.lineTo(nextPoint.x, nextPoint.y);
    ctx.stroke();
  }
  ctx.restore();
}


// 从public/captcha文件夹中随机获取一张图片
async function getRandomBackgroundImage() {
  let captchaImageDir = path.resolve(__dirname, "../../public/captcha");
  let files = await fs.promises.readdir(captchaImageDir);
  let fileName = files[randomIn(files.length - 1, 0)];
  return `${captchaImageDir}/${fileName}`;
}

module.exports = {
  create: makeCaptchaImage,
  verify
};