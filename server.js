'use strict'
var moment = require('moment-timezone');
moment().tz("Asia/Jakarta").format();
moment.tz.setDefault("Asia/Jakarta");

var startRequest = new Date();
/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstraps Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass a relative path from the project root.
*/

const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .wsServer()
  .fireHttpServer()
  .catch(console.error)
  .then(() => {
    console.log('Startup Server Time:', new Date() - startRequest, 'ms');
  })
