'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ParkingTransactionsSchema extends Schema {
  up () {
    this.create('parking_transactions', (table) => {
      table.uuid('parking_transactions_id').unique().defaultTo(this.db.raw('public.gen_random_uuid()'))
      table.string('parking_transactions_vechile', 5).notNullable()
      table.string('parking_transactions_number', 12).notNullable()
      table.decimal('parking_transactions_price').nullable()
      table.decimal('parking_transactions_discount').nullable()
      table.timestamp('parking_transactions_in').defaultTo('NOW()')
      table.timestamp('parking_transactions_out').nullable()
      table.timestamp('created_at').defaultTo('NOW()')
      table.timestamp('updated_at').defaultTo('NOW()')
      table.timestamp('deleted_at').nullable()
    })
  }

  down () {
    this.drop('parking_transactions')
  }
}

module.exports = ParkingTransactionsSchema
