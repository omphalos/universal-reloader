var socket = io.connect(window.location.origin)
socket.on('update', function onUpdate(data) {
  window.location.reload()
})