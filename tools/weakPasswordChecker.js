/**
 * 检查字符串中是否包含弱密码字符串
 * @param {string} password 密码
 * @returns {String[]} result.includes 字符串数组，包含哪些弱密码字符串(从字典中查到的)
 */
function checker(password) {
  const includes = [];
  dict.forEach(wp => {
    if(password.includes(wp)) 
      includes.push(wp);
  });
  return {
    pass: !includes.length,
    includes
  };
}



/**
 * Weak Password dictionary from {@link https://github.com/DictionaryHouse/Weak-password},
 * Merge `weak_pass_chinese.txt` with `weak_pass_top100.txt` of this repository
 */
const dict = `abcd1234
abcd4321
5201314
1234abcd
1234ABCD
ABCD1234
Aa123456
a123456
abc12345
123456789aa
ABCD!@#$
!@#$ABCD
!@#$abcd
aabbcc112233
aabbcc1122##
aa1122##
asd123
asd456
asdasd
qwe123
123qwe
abcd123456
abcd123
a12345678
nimagebi
123456abc
abc123456
123456qaz
abc123
ABCD123123
a1b2c3
a1b2c3d4
a!b@c#d$
A1B2C3D4
A!B@C#
A!B@C#D$
aaa123
abcd888
qq00.00
123456a
#User#
#User#123
#User#888
#Admin#
#123456
qaz123
qq123123
abc@123456
Abc@123456
123456qwe
letmein
1123456
Abcd1234567890
123456789
123456
a123456789
1234567890
woaini1314
qq123456
123456789a
147258369
zxcvbnm
987654321
12345678910
qq123456789
123456789.
7708801314520
woaini
5201314520
q123456
1233211234567
123123123
123456.
0123456789
asd123456
aa123456
135792468
q123456789
12345678900
woaini520
woaini123
zxcvbnm123
1111111111111111
w123456
aini1314
abc123456789
111111
woaini521
qwertyuiop
1314520520
1234567891
qwe123456
000000
1472583690
1357924680
789456123
123456789abc
z123456
1234567899
aaa123456
www123456
123456789q
123abc
w123456789
7894561230
123456qq
zxc123456
123456789qq
1111111111
111111111
0000000000000000
1234567891234567
qazwsxedc
qwerty
123456..
zxc123
asdfghjkl
0000000000
1234554321
123456q
123456aa
9876543210
110120119
qaz123456
qq5201314
123698745
000000000
as123456
123123
5841314520
z123456789
52013145201314
a123123
caonima
a5201314
wang123456
123456789..
woaini1314520
123456asd
aa123456789
741852963`.split("\n");

exports.checker = checker;
exports.dictionary = dict;
