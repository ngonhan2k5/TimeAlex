var Datastore = require('nedb')
  , db = new Datastore({ filename: '../db/usertz.db', autoload: true });
var res = require('./resolve')

const timeAlex = {
  timeAlex: function(){
    console.log(arguments)
    var arg = arguments
    return (new Date()).toString()
  },
  // @cnn reg +7
  reg : function (data, tz){
    var {userID, user, send} = data;

    if (isNaN(tz)) return

    var newData = { _id: userID, tz: tz }
    db.insert(newData, function (err, newDoc) {   // Callback is optional
      console.log("Reg error", err, err && err.errorType)
      if (!err)
        send(user + ' has registered timezone UTC'+ tz);
      else if (err.errorType == 'uniqueViolated'){
        db.update({ _id: userID }, newData, {}, function (err, numReplaced) {
          console.log("Update error", err, numReplaced)
          if (!err && numReplaced)
            send(user + ' has changed timezone to UTC'+ tz);
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
  show : function (data, tz){
    var {userID, user, send} = data;
    console.log(arguments)

    if (isNaN(tz)) return

    var query = { _id: userID}
    db.find(query, function (err, docs) {   // Callback is optional
      console.log("Found: ", docs)
      if (!err && docs && docs.lenght > 0){
        var tz = docs.pop().tz
        send(user + ' has registered UTC'+ tz + ' timezone');
     }else{
        send('Timezone lookup failed')
      }

      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
    });
  }, // end reg
  //
  time : function (data, message){
    //console.log(arguments)
    var {userID, user, send} = data;
    var items = res.process(message);
    var msg = []
    for (const item of items) {
      msg.push('\"' + item.key + '\" meaning ['+ item.value.utc().format('ll LT') + '] in UTC')
    }
    if (msg.length)
      send(data.user + ' has mention '+  msg.join(' and '))
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
