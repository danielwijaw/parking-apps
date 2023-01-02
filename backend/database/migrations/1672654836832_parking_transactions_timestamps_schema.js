'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Database = use('Database')

class ParkingTransactionsTimestampsSchema extends Schema {
  async up () {
    await Database.raw(`
      CREATE OR REPLACE FUNCTION upd_timestamp() RETURNS TRIGGER
      LANGUAGE plpgsql
      AS
      $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$;

      CREATE TRIGGER parking_transactions
        BEFORE UPDATE
        ON parking_transactions
        FOR EACH ROW
        EXECUTE PROCEDURE upd_timestamp();

      CREATE TRIGGER setup_log_activities
        BEFORE UPDATE
        ON setup_log_activities
        FOR EACH ROW
        EXECUTE PROCEDURE upd_timestamp();
    `)
  }

  down () {

  }
}

module.exports = ParkingTransactionsTimestampsSchema
