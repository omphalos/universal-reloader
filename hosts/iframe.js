var fs = require('fs')
  , http = require('http')

module.exports = function(options) {

  var listenAndReloadScript = fs.
    readFileSync(__dirname + '/../assets/listenAndReload.js').
    toString();

  var index = fs.
    readFileSync(__dirname + '/../assets/index.html').
    toString().
    replace("{{url}}", options.url).
    replace("{{listenAndReload}}", listenAndReloadScript)

  return http.createServer(function(req, res) {

    if(options.verbose) console.log('serving index.html')

    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(index)
  })
}
