const fs = require('fs');
const { createCanvas } = require('canvas');

module.exports = function(behavior) {
  console.log(behavior);
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');

  // 设置背景色
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 1920, 1080);

  ctx.moveTo(behavior[0].x, behavior[0].y);

  for(let record of behavior) {
    if(record.type === "mousemove") {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "red";
      ctx.lineTo(record.x, record.y);
      ctx.stroke();
    } else if(record.type === "mousedown") {
      ctx.beginPath();
      ctx.strokeStyle = "green";
      ctx.fillStyle = "green";
      ctx.arc(record.x, record.y, 8, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
      ctx.closePath()
      ctx.fill();
    }
  }

  const out = fs.createWriteStream(__dirname + '/test.png')
  const stream = canvas.createPNGStream()
  stream.pipe(out)
  out.on('finish', () =>  console.log('已生成登录行为图'))
}