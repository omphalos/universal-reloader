var fs   = require('fs')
  , http = require('http')

var listenAndReloadScript
  , index

module.exports = function onIFramRequest(req, res, options) {

  listenAndReloadScript = listenAndReloadScript || fs.
    readFileSync(__dirname + '/../assets/listenAndReload.js').
    toString();

  index = index || fs.
    readFileSync(__dirname + '/../assets/index.html').
    toString().
    replace("{{url}}", options.url).
    replace("{{listenAndReload}}", listenAndReloadScript)

  if(options.verbose) console.log('serving index.html')

  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(index)
}
