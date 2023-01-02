'use strict'

const Schema = use('Schema')

class SetupDbSchema extends Schema {
  async up () {
    await this.db.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto" schema public')
    await this.db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" schema public')
  }

  down () {
    
  }
}

module.exports = SetupDbSchema