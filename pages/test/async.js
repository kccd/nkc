async function fn() {
  try{
    console.log('1');
    let fn_1 = () => {
      console.log('2');
    }
    await setTimeout( fn_1, 3000);
    await console.log('3');
  }
  catch(err) {
    console.log(err);
  }
  
}
fn();