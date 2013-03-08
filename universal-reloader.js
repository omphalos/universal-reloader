#!/usr/bin/env node

var _ = require('underscore')
  , fs = require('fs')
  , http = require('http')
  , minimatch = require('minimatch')
  , optimist = require('optimist')
  , socketIo = require('socket.io')
  , watch = require('watch')

var argv = optimist.
  usage('Automatically reload your browser when files change.\nUsage: $0').
  options('debounce', { alias: 'd', default: 100, describe: 'Debounce interval for throttling websocket publications' }).
  options('folder', { alias: 'f', default: '.', describe: 'Root folder to watch for changes' }).
  options('mask', { alias: 'm', default: '**/*', describe: 'Pipe-delimited file patterns to watch (e.g., **/*.css|**/*.html)' }).
  options('port', { alias: 'p', default: 8080, describe: 'Port to run on'}).
  options('recent', { alias: 'r', default: 100, describe: 'Interval of checks to the most-recently modified file' }).
  options('url', { alias: 'u', describe: 'Url to auto-reload on file changes (e.g., http://example.com)' }).
  options('verbose', { alias: 'v', describe: 'Toggle verbose logging' }).
  demand('url').
  argv

var argFilters = argv.mask.split('|')
  , debounceInterval = argv.debounce
  , folderRoot = argv.folder
  , port = argv.port
  , url = argv.url
  , mostRecentFileCheckInterval = argv.recent
  , verbose = argv.verbose === true

//////////////////////
// start web server //
//////////////////////

var index = fs.
  readFileSync(__dirname + '/assets/index.html').
  toString().
  replace("{{url}}", url)

var httpServer = http.createServer(function(req, res) {

  if(verbose) console.log('serving index.html')

  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(index)
})

//////////////////////
// set up websocket //
//////////////////////

var io = socketIo.listen(httpServer)

httpServer.listen(port)

console.log('Listening on port ' + port + '.')
console.log('Navigate to http://localhost:' + port + ' to see your universal-reloadable page.')

var notify = _.debounce(function notify() {

  if(verbose) console.log('emitting update')

  io.sockets.emit('update', {})

}, debounceInterval)

/////////////////
// watch files //
/////////////////

var mostRecentFile

function filter(file) {

  return argFilters.some(function testArgFilter(argFilter) {

    var result = minimatch(file, argFilter)
    if(verbose) console.log(file + (result ? ' matched ' : ' failed to match ') + argFilter)
    return result
  })
}

function onWatchEvent(file, current, previous) {

  if(current && typeof file === 'string' && filter(file)) {

    mostRecentFile = { file: file, stats: current }
  }

  notify()
}

watch.watchTree(folderRoot, onWatchEvent)

////////////////////////////////////////////////////////////////////
// set up most-recent-file listener (for optimized file watching) //
////////////////////////////////////////////////////////////////////

setInterval(function checkMostRecentFile() {

  if(!mostRecentFile) return

  fs.stat(mostRecentFile.file, function(err, stats) {

    if(err) return mostRecentFile = null
    if(mostRecentFile.stats.mtime.getTime() === stats.mtime.getTime()) return

    mostRecentFile.stats = stats
    notify()
  })

}, mostRecentFileCheckInterval)
