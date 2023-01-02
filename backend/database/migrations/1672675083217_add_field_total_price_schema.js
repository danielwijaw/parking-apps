'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddFieldTotalPriceSchema extends Schema {
  up () {
    this.table('parking_transactions', (table) => {
      table.decimal('parking_transactions_total').nullable()
    })
  }

  down () {
    this.table('add_field_total_prices', (table) => {
      table.dropColumn('parking_transactions_total')
    })
  }
}

module.exports = AddFieldTotalPriceSchema
