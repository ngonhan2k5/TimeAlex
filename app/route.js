var Datastore = require('nedb')
//var datastore = require('nedb-promise')
var db = new Datastore({ filename: 'db/usertz.db', autoload: true });
//var db = datastore({ filename: 'db/usertz.db', autoload: true });
var res = require('./resolve')
var moment = require('moment-timezone');

const timeAlex = {
  timeAlex: function(){
    console.log(arguments)
    var arg = arguments
    return (new Date()).toString()
  },
  // @cnn reg +7
  reg : function (data, tz, pmKey, pm=null){
    console.log(666, tz, pmKey, pm)

    var {userID, user, send, isDM} = data;

    if (!tz) {
      if (isDM)
      send('Syntax:\r\n `reg -12..+12 [msg on|off]`\r\n `Ex: reg -7 msg on`')
      else
      return send('Syntax:\r\n `@TimeAlexa reg -12..+12 [msg on|off]`\r\n `Ex: @TimeAlexa reg -7 msg on`'.replace(isDM?'@TimeAlexa ':'',''))

    }else if (!moment.tz.zone(tz)){
      return send('Timezone name wrong\r\n To find right timezone name, use `@TimeAlexa find abc`\r\n `Ex: @TimeAlexa find los`'.replace(isDM?'@TimeAlexa ':'',''))
    }

    var newData = { _id: userID, tz: tz},
    dmsg = (pmKey=='msg' && (pm=='on' || pm==null) )

    if (pmKey=='msg') newData.dmsg = dmsg

    db.insert(newData, function (err, newDoc) {   // Callback is optional
      console.log("Reg error", err, err && err.errorType)
      if (!err)
      send( (isDM?'You': user) + ' has registered timezone **'+ tz + '** and **Direct Message ' + (dmsg?'enabled':'disabled')+ '**');
      else if (err.errorType == 'uniqueViolated'){
        db.update({ _id: userID }, { $set: newData}, {}, function (err, numReplaced) {
          console.log("Update error", err, numReplaced)
          if (!err && numReplaced)
          send( (isDM?'You': user) + ' has changed timezone to **'+ tz + '**' + (pmKey=='msg'?(' and **Direct Message ' + (dmsg?'enabled':'disabled')+'**'):'') );
          else if (err){
            send('Timezone change failed')
          }
        });
      }else{
        send('Timezone register failed')
      }

      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
    });
  }, // end reg
  info : function (data){
    var {userID, user, send, isDM} = data;
    console.log(arguments)

    var query = { _id: userID}
    db.find(query, function (err, docs) {   // Callback is optional
      console.log("Found: ", docs)
      if (!err && docs && docs.length > 0){
        var {tz, dmsg} = docs.pop()
        send((isDM?'You':user) + ' has **'+ tz + '** timezone and **Direct Message ' + (dmsg?'opt-in':'opt-out')+ "** with me");
      }else{
        send('Your setting not found. Please register your setting using:\r\n `@TimeAlexa reg {timezone} [msg on|off]`\r\n `Ex: @TimeAlexa reg America/New_York msg on`')
      }

    });
  }, // end reg
  //
  time : function (data, message){
    //console.log(arguments)
    var {userID, user, send, evt:{d:{mentions}} } = data;
    console.log(121212, mentions)
    var items = res.process(message);

    utils.userTz(userID).then(function(tz){
      console.log(343434, userID, fromUserTz)
      var msg = []
      var fromUserTz = tz.tz
      // answer to channel
      for (const item of items) {
        msg.push('\"**' + item.key + '**\" is **'+ utils.tzConvert(item.data, fromUserTz) + ' in UTC**')
      }
      if (msg.length)
      send(data.user + ' has mention '+  msg.join(' and '))

      // PM to mentioned users
      for (const muser of mentions) {
        // check mentioned user setting option dmsg
        utils.userTz(muser.id).then(function(tz){

          if (!tz || !tz.dmsg) return

          var msg = [],
          toUserTz = tz.tz

          for (const item of items) {
            msg.push('\"**' + item.key + '**\" is **'+ utils.tzConvert(item.data, fromUserTz, toUserTz) + ' in your TimeZone**')
          }
          if (msg.length)
            send(data.user + ' has mention (in <#514297100566265869>):\r\n'+  msg.join(' and\r\n'), muser.id)
        })
      }
    })
  },
  find: function(data, kw){
    if (!kw) return
    var {send} = data;
    var tzList = moment.tz.names()
    var result = tzList.filter(function(i){return i.toUpperCase().indexOf(kw.toUpperCase()) > -1})

    if (result.lengh> 5){
      result = result.slice(0,5)
      result.push('...')
    }
    send(result.join(', '))
  },
  help: function(data){
    var {send, isDM} = data;
    utils.sendHelp(send, isDM)
  }
}

var utils = {
  userTz : function(userID){
    return new Promise(function(resolve, reject) {
      var query = { _id: userID }
      db.findOne(query , function (err, doc) {   // Callback is optional
        console.log("Found: ", err, doc)
        if (err){
          reject(err)
        }else{
          resolve(doc)
        }
      })
    })
    //return doc.tz
  },
  tzConvert : function(timeData, fromTz, toTz='UTC'){
    console.log(44444444, arguments)
    let a = moment.tz(timeData.value, timeData.format, fromTz)
    a.tz(toTz)
    return a.format('ll LT')
  },
  sendHelp: function(send, isDM){
    send('Your timezone will using to Translate the **considerated time content**: \r\n \
    1. In your message to UTC+0 and send right in channel\r\n \
    2. In chat messages of others one that mentioned you and will send to you as Direct Messages \r\n \
    (only with **Direct Message option** is on)\r\n \
    **Considerated time** examples: "**3pm**", "**12am**", "**tomorrow 3pm**", "**yesterday 12am**", "**tmw 12am**" \r\n \
    Command syntax:\r\n \
    `@TimeAlexa time` to show current time \r\n \
    `@TimeAlexa reg {timezone} [msg on|off]` to register \r\n \
    `@TimeAlexa info` to check your setting \r\n \
    `@TimeAlexa find` to find timezone right name \r\n'.replace(isDM?/@TimeAlexa /g:'', ''));
  }
}

//(cmd, args, userID, user, send)
const route = function(action, data, args){
  // console.log(999999, arguments)
  // data.push(userID)
  // data.push(user)
  // data.push(send)
  return timeAlex[action] && timeAlex[action].apply(timeAlex, [data, ...args]);
}


module.exports = {
  process: timeAlex,
  route:route
}
