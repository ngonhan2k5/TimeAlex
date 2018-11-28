const express = require('express')
const app = express()
const port = 3000

var start = function(send){
app.use('/',express.static('public'))

app.get('/reg', (req, res) => {

	const route = require('./route')

	console.log(req.query.token)
	console.log(req.get('Accept-Language'))
	if (req.query.token){
		route.registerTz(req.query, send).then(
			(ret) => {
				res.send(`${ret.user}: Thank you for registered!`)
			},
			(err) => {
				res.send("Token expired. Please use <b>reg</b> command again from discord")
			},
		).finally(
			() => {
				if(!res.headersSent)
					res.send('Nothing')
			}
		)
		// tokens.findOne({token:req.query.id}, (err,doc) => {
		// 	if (doc)
		// 		res.send(doc)	
		// 	else
		// 		res.send('NG')
		// })
	}else{
		res.send('Sorry!Nothing happed')
	}
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

module.exports = {
	start:start
}
