var moment = require('moment');
// console.log(moment().format());
var dic = [
  {reg:/(?:\s)*([1-2]?\d:[0-6]?\d)\s*(EST|PST|DST|EET)(?:\s)*/ig, format:'HH:mm', res:'_24h'}, //12-11am,12-11pm
  {reg:/(?:\s)*(1?\d:[0-6]?\d)\s*(am|pm)(?:\s)*(EST|PST|DST|EET)?(?:\s)*/ig, format:'hh:mm a', res:'ampm'}, //12-11am,12-11pm
  {reg:/(?:\s)*(1?\d)\s*(am|pm)(?:\s)*(EST|PST|DST|EET)?(?:\s)*/ig, format:'hh a', res:'ampm'}, //12-11am,12-11pm
],
resolve = {
  ampm: function (match, format){
    var match = match.splice(1)
    // console.log(888888, match)
    var ret = {}
    if (match[2])
      ret.abbr = match.pop().toUpperCase()

    // console.log(888888, match.join(' '), format)
    return { ...ret, value:match.join(' '), format: format}

  },
  _24h: function (match, format){
    var match = match.splice(1)
    // console.log(888888, match)
    var ret = {}
    if (match[1])
      ret.abbr = match.pop().toUpperCase()

    // console.log(888888, match.join(' '), format)
    return { ...ret, value:match.join(' '), format: format}

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
    dic.map(function(item){
      //console.log(dic[key]);
      var {reg, res, format} = item
      console.log(77777777,item)
      do {
        m = reg.exec(s);
        if (m) {
          console.log(m[1], 222, m[2]);
          ret.push({key:m[0], ... resolve[res] && resolve[res](m, format)})
        }
      } while (m);

      s = s.replace(reg, ' ')

      console.log(1111,s)
    })
    return ret;
  }

}
