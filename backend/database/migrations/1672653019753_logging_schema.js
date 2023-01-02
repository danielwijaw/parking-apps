'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LoggingSchema extends Schema {
  up () {
    this.create('setup_log_activities', (table) => {
      table.uuid('setup_log_activities_id').unique().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.string('setup_log_activities_models', 120).nullable()
      table.string('setup_log_activities_activity', 60).nullable()
      table.json('setup_log_activities_old_data').nullable()
      table.json('setup_log_activities_newest_data').nullable()
      table.timestamp('created_at').defaultTo('NOW()')
      table.timestamp('updated_at').defaultTo('NOW()')
      table.timestamp('deleted_at').nullable()
    })
  }

  down () {
    this.drop('setup_log_activities')
  }

}

module.exports = LoggingSchema
