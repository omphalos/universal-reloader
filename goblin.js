var util = require('util')

function Buffer(res) {

  var self = this

  self.headers = {}
  self.res = res

  self._chunks = []

  ///////////////////////////////
  // monkey patch the response //
  ///////////////////////////////

  self._end = res.end
  self._write = res.write
  self._writeHead = res.writeHead

  function write(chunk, encoding) {
    if(chunk) self._chunks.push(chunk)
    if(encoding) self._encoding = encoding
  }

  res.writeHead = function(statusCode, headers) {

    self.headers = headers
    self._statusCode = statusCode

    res.emit('writeHead', headers, statusCode)
  }

  res.write = function(chunk, encoding) {

    write(chunk, encoding)

    res.emit('write', chunk, encoding)
  }

  res.end = function(chunk, encoding) {

    write(chunk, encoding)

    res.emit('end', chunk, encoding)
  }
}

//////////////////////
// public interface //
//////////////////////

Buffer.prototype.getData = function getData() {
  return this._data || this._chunks.join('')
}

Buffer.prototype.setData = function setData(data) {
  return this._data = data
}

Buffer.prototype.send = function send() {

  var data = this.getData()

  if(this._data)
    this.headers['content-length'] = data.length

  this._writeHead.call(this.res, this._statusCode, this.headers)
  this._end.call(this.res, data, this._encoding)
}

exports.Buffer = Buffer
