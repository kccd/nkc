module.exports = async (init, moveData) => {
  const total = await init();
  const num = 10000;
  const errData = [];
  const countOfFor = Math.ceil(total/num);
  for (let i = 0; i < countOfFor; i++) {
    const err = await moveData(total, num*i, num);
    if(err) errData.push(err);
  }
  console.log('所有数据转移完成！');
  if(errData.length !== 0){
    console.log('错误数据如下：');
    console.log(errData);
  }
};