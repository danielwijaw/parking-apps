'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
const ResponseHelper = require("../app/Library/ResponseHelper")
const metadataVersion = require("./../metadata.json")

Route.group(() => {

  Route.resource("category-class-student", "CategoryClassStudentController").apiOnly();

}).prefix("api/v1");

Route.get('*', () => {
  return ResponseHelper({
    message: "Parking Apps",
    data: {
      codename: "KeDa-Tech",
      version: metadataVersion.buildMajor+"."+metadataVersion.buildMinor+"."+metadataVersion.buildRevision
    }
  })
})
