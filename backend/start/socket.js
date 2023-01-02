'use strict'

/*
|--------------------------------------------------------------------------
| Websocket
|--------------------------------------------------------------------------
|
| This file is used to register websocket channels and start the Ws server.
| Learn more about same in the official documentation.
| https://adonisjs.com/docs/websocket
|
| For middleware, do check `wsKernel.js` file.
|
*/

const Ws = use('Ws')

Ws.channel('chat', ({ socket }) => {
  console.log('user joined with %s socket id', socket.id)
})

Ws.channel('news', ({ socket }) => {
  console.log('a new subscription for news topic')
})

Ws.channel('queue', ({ socket }) => {
  console.log('user joined with %s socket id', socket.id)
})

Ws.channel('queue-days', ({ socket }) => {
  console.log('user joined with %s socket id', socket.id)
})

Ws.channel('notifications', ({ socket }) => {
  console.log('user joined with %s socket id', socket.id)
})

Ws.channel('meeting-ws', ({ socket }) => {
  console.log('user joined with %s socket id', socket.id)
})

Ws.channel('queue-hospital', ({ socket }) => {
  console.log('user joined with %s socket id', socket.id)
})

Ws.channel('notification:*', 'NotificationController')
