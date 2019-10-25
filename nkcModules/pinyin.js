const pinyin = require("pinyin");

const func = {};

const letterStr = "0123456789abcdefghijklmnopqrstuvwxyz*";
const letters = letterStr.split("");

func.getFirstLetter = (text = "") => {
  text = text.slice(0, 1);
  if(text === "") return "*";
  let letter = pinyin(text.slice(0, 1), {
    style: pinyin.STYLE_FIRST_LETTER
  })[0][0];
  letter = letter.toLowerCase();
  if(!letters.includes(letter)) {
    letter = "*";
  }
  return letter;
};

func.sortByFirstLetter = (type, arr, key) => {
  let results = [];
  if(type === "array") {
    
  } else if(type === "object") {
    const obj = {};
    letters.map(l => {
      obj[l] = [];
    });
    arr.map(a => {
      const text = a[key];
      const letter = func.getFirstLetter(text);
      obj[letter].push(a);
    });
    letters.map(l => {
      results = results.concat(obj[l]);
    });
    return results;
  }
};

module.exports = func;
