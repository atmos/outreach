var url     = require("url")
  , http    = require("http")
  , redis   = require("redis")


info   = url.parse(process.env.REDISTOGO_URL || 'redis://localhost:6379')
client = redis.createClient(info.port, info.hostname)

if(info.auth)
  client.auth(info.auth.split(":")[1])
  
client.on("error", function (err) {
  console.log("Redis Error " + err)
})

userFromAPI = function(name, cb) {
  var options = { host: 'api.twitter.com', path: "/1/users/lookup.json" }
   
  options.path += "?screen_name=" + name
      
  http.get(options, function(httpRes) {
    var data = ""
    httpRes.on('data', function (chunk) {
      data += chunk
    })
    httpRes.on('end', function () {
      var user = JSON.parse(data)

      if(user.length > 0) {
        cb(null, JSON.stringify(user[0]))
      } else {
        cb(true, "{}")
      }
    })
  }).on('error', function(err) {
    cb(true, "{}")
  })
}

userFromCache = function(name, cb) {
  var key = "outreach:user:" + name
  client.get(key, function (err, reply) {
    if(reply == null) {
      userFromAPI(name, function(err, data) {
        client.set(key, data)
        client.expire(key, 86400)
        cb(err, data)
      })
    } else {
      console.log("Cache hit for " + name)
      cb(null, reply.toString())
    } 
  })
}

exports.get = function(name, cb) {
  userFromCache(name, cb);
}
