var moment = require('moment');
// console.log(moment().format());
var dic = {
  ampm2: {reg:/(?:\s)*(1?\d:[0-6]?\d)\s*(am|pm)(?:\s)*/g, format:'hh:mm a', res:'ampm'}, //12-11am,12-11pm
  ampm: {reg:/(?:\s)*(1?\d)\s*(am|pm)(?:\s)*/g, format:'hh a', res:'ampm'}, //12-11am,12-11pm
},
resolve = {
  ampm: function (match, key){
    match = match.splice(1)
    console.log(888888, match.join(' '), key)
    return {value:match.join(' '), format: dic[key].format}
  }
},
abbreviation = {
  tomorrow: ['2MORO','TMR', 'TMRW'],
  yesterday:['YSTD','YDA','YTD', 'YDAY'],
  today: ['2DA', '2DAY', '2D', 'TDY']
},
abbrGen = function(abbreviation){
  var ret = {}
  for (var key in abbreviation) {
    if (abbreviation.hasOwnProperty(key)) {
      var item = abbreviation[key]
      for (var i in item) {
        ret[item[i]] = key;
      }
    }
  }
  return ret;
}
console.log(abbrGen(abbreviation));
// var fName = function(arg)
// {
//    var myName = arg.callee.toString();
//    myName = myName.substr('function '.length);
//    myName = myName.substr(0, myName.indexOf('('));
//    return myName;
// }

module.exports = {
  // find time in text
  process: function (s){
    var ret = []
    for (var key in dic) {
      if (dic.hasOwnProperty(key)) {
        console.log(key, dic[key]);
        var {reg, res} = dic[key]

        do {
          m = reg.exec(s);
          if (m) {
            console.log(m[1], 222, m[2]);
            ret.push({key:m[0], data: resolve[res] && resolve[res](m, key)})
          }
        } while (m);

        s = s.replace(reg, ' ')
        console.log(1111,s)
        // var ret = s.match(new RegExp(reg))
        // if (ret){
        //   return resolve[key] && resolve[key](ret, key)
        // }
      }
    }
    return ret;
  }

}
