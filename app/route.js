var Datastore = require('nedb')
  , db = new Datastore({ filename: 'db/usertz.db', autoload: true });
var res = require('./resolve')

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

    if (isNaN(tz)) {
      if (isDM)
        send('Syntax:\r\n `reg -12..+12 [msg on|off]`\r\n `Ex: reg -7 msg on`')
      else
        send('Syntax:\r\n `@TimeAlexa reg -12..+12 [msg on|off]`\r\n `Ex: @TimeAlexa reg -7 msg on`')
      return
    }

    var newData = { _id: userID, tz: tz},
        dmsg = (pmKey=='msg' && (pm=='on' || pm==null) )

    if (pmKey=='msg') newData.dmsg = dmsg

    db.insert(newData, function (err, newDoc) {   // Callback is optional
      console.log("Reg error", err, err && err.errorType)
      if (!err)
        send( (isDM?'You': user) + ' has registered timezone **UTC'+ tz + '** and **Direct Message ' + (dmsg?'enabled':'disabled')+ '**');
      else if (err.errorType == 'uniqueViolated'){
        db.update({ _id: userID }, { $set: newData}, {}, function (err, numReplaced) {
          console.log("Update error", err, numReplaced)
          if (!err && numReplaced)
            send( (isDM?'You': user) + ' has changed timezone to **UTC'+ tz + '**' + (pmKey=='msg'?(' and **Direct Message ' + (dmsg?'enabled':'disabled')+'**'):'') );
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
        send((isDM?'You':user) + ' has **UTC'+ tz + '** timezone and **Direct Message ' + (dmsg?'enabled':'disabled')+ "**");
     }else{
        send('Your setting not found. Please register your setting using:\r\n `@TimeAlexa reg -12..+12 [msg on|off]`\r\n `Ex: @TimeAlexa reg -7 msg on`')
      }

      utils.sendHelp(send)

      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
    });
  }, // end reg
  //
  time : function (data, message){
    //console.log(arguments)
    var {userID, user, send, evt:{d:{mentions}} } = data;
    console.log(121212, mentions)
    var items = res.process(message);
    var msg = []
    // answer to channel
    for (const item of items) {
      msg.push('\"**' + item.key + '**\" meaning **'+ item.value.utc().format('ll LT') + ' in UTC**')
    }
    if (msg.length)
      send(data.user + ' has mention '+  msg.join(' and '))

    // PM to mentioned users
    for (const muser of mentions) {
      // check mentioned user setting option dmsg
      var utz = utils.userTz(muser.id)

      if (!utz || !utz.dmsg) break

      var msg = []
      for (const item of items) {
        msg.push('\"**' + item.key + '**\" meaning **'+ item.value.format('ll LT') + ' in your TZ**')
      }
      if (msg.length)
        send(data.user + ' has mention (in <#514297100566265869>):\r\n'+  msg.join(' and\r\n'), muser.id)
    }
  }
}

var utils = {
  userTz : function(userID){
    var query = { _id: userID }
    db.find(query, function (err, docs) {   // Callback is optional
      console.log("Found: ", docs)
      if (!err && docs && docs.lenght > 0){
        return docs.pop()
      }
    });
  },
  sendHelp: function(send){
    send('===========================================================================\r\n \
      Your timezone will using to Translate the **considerated time content**: \r\n \
      1. In your message to UTC+0 as explaination send right in channel\r\n \
      2. In chat messages of others one that mentioned you and will send to you as Direct Messages\r\n \
      **Considerated time** examples: "**3pm**", "**12am**", "**tomorrow 3pm**", "**yesterday 12am**", "**tmw 12am**"');
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

