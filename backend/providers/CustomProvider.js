'use strict'
require('dotenv').config('DB_CONNECTION')
const { ServiceProvider } = require('@adonisjs/fold')

const Database = require('knex')({
  client: process.env.DB_CONNECTION,
  connection: {
    host : process.env.DB_HOST_SLAVE || process.env.DB_HOST,
    user : process.env.DB_USER_SLAVE || process.env.DB_USER,
    port : process.env.DB_PORT_SLAVE || process.env.DB_PORT,
    password : process.env.DB_PASSWORD_SLAVE || process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE_SLAVE || process.env.DB_DATABASE
  },
  debug: false
});

class CustomProvider extends ServiceProvider {
  /**
   * Register namespaces to the IoC container
   *
   * @method register
   *
   * @return {void}
   */
  async existsFn (data, field, message, args, get) {
    const value = get(data, field)
    if (!value) {
      return
    }

    const [table, column, fieldExcept, valueExcepts] = args

    if(fieldExcept && valueExcepts && (/^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i.test(valueExcepts) == true)){
      const rowField = await Log.table(table).where(column, value).whereNot(fieldExcept, valueExcepts).where('deleted_at', null).first()
      if(!rowField){
        return
      }
    }

    const row = await Database.table(table).where(column, value).where('deleted_at', null).first()

    if (row) {
      throw message
    }
  }

  async relationFn (data, field, message, args, get) {
    const value = get(data, field)
    if (!value) {
      return
    }

    const [table, column, type] = args

    const row = await Database.table(table).where(column, value).where('deleted_at', null).first()

    if (!row) {
      throw 'relations validation failed because value in not found'
    }
  }

  async uuidFn (data, field, message, args, get) {
    const value = get(data, field)
    if (!value) {
      return
    }

    if(/^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i.test(value) == false){
      throw 'relations uuid failed because value in not uuid'
    }
  }

 async withoutFn (data, field, message, args, get) {
   const value = get(data, field)
   if (!value) {
     return
   }

   const [table, column, secondArgument] = args

    const row = await Database.table(table).where(column, value).where(column, secondArgument).where('deleted_at', null).first()

    if (row) {
      throw 'relations failed because value ('+value+') is exist'
    }
 }

  async hexcolorFn (data, field, message, args, get) {
    const value = get(data, field)
    const pattern = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    if (!value) {
      return
    }

    if(pattern.test(value) === false){
      throw 'relations hexcolor failed because value in not hex color'
    }
  }

  async timeFn (data, field, message, args, get) {
    const value = get(data, field)
    const pattern = new RegExp("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    if (!value) {
      return
    }

    if(pattern.test(value) === false){
      throw 'relations time failed because value in not time (HH:MM)'
    }
  }

  register () {}

  boot () {
    const Validator = use('Validator');
    Validator.extend('exists', this.existsFn);
    Validator.extend('relations', this.relationFn);
    Validator.extend('uuid', this.uuidFn);
    Validator.extend('hexcolor', this.hexcolorFn);
    Validator.extend('withoutme', this.withoutFn);
    Validator.extend('time', this.timeFn);
  }
}

module.exports = CustomProvider
