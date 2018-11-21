var moment = require('moment');
// console.log(moment().format());
var dic = {
    ampm: {reg:/(?:\s)*(1?\d)\s*(am|pm)(?:\s)*/g, moment:'hh a'} //12-11am,12-11pm
  },
  resolve = {
    ampm: function (match, key){
      match = match.splice(1)
      console.log(888888, match.join(' '), key)

      return moment(match.join(' '), dic[key].moment)
    }
  }

var fName = function(arg)
{
   var myName = arg.callee.toString();
   myName = myName.substr('function '.length);
   myName = myName.substr(0, myName.indexOf('('));
   return myName;
}

module.exports = {

  process: function (s){
    var ret = []
    for (var key in dic) {
        if (dic.hasOwnProperty(key)) {
            console.log(key, dic[key]);
            var reg = dic[key].reg
            do {
                m = reg.exec(s);
                if (m) {
                    console.log(m[1], 222, m[2]);
                    ret.push({key:m[0], value: resolve[key] && resolve[key](m, key)})
                }
            } while (m);


            // var ret = s.match(new RegExp(reg))
            // if (ret){
            //   return resolve[key] && resolve[key](ret, key)
            // }
        }
    }
    return ret;
  }

}
