var PORT = (process.env.PORT || 3000)
  , HOST = (process.env.APP_HOST || 'localhost')

var fs      = require('fs')
  , express = require('express')
  , app     = express.createServer()
  , user    = require("./app/user")

app.configure(function(){
  app.use(express.logger('\x1b[33m:method\x1b[0m \x1b[32m:url\x1b[0m :response-time'))
  app.use(app.router)
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}))
})

app.get('/user/:name', function(req,res) {
  var name = req.params.name

  res.header("Content-Type", "application/json")

  user.get(name, function(err, data) {
    if(err) {
      res.send("{}", 404)
    } else {
      res.send(data, 200)
    }
  })
})

app.listen(PORT)
console.log('App started on port: ' + PORT)

module.exports = app;