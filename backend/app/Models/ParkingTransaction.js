'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const StaticType = require('./ParkingStaticData')

const typeParking = StaticType.typeVechile

class ParkingTransaction extends Model {

    static get incrementing () {
        return true
    }

    static get table () {
      return 'parking_transactions'
    }

    static get primaryKey () {
      return 'parking_transactions_id'
    }

    static get searchField (){
      return 'parking_transactions_number'
    }

    static get hidden() {
      return ["created_at", "updated_at", "deleted_at"];
    }

    static fillable(){
        return {
            created: [
                "parking_transactions_vechile",
                "parking_transactions_number",
                "parking_transactions_discount",
            ],
            updated: [
                "parking_transactions_vechile",
                "parking_transactions_number",
                "parking_transactions_discount",
            ],
        }
    }

    static validator(){
        return {
            created: {
                parking_transactions_vechile: "required|max:5|in:"+typeParking.join(","),
                parking_transactions_number: "required|max:12",
                parking_transactions_discount: "required|number"
            },
            updated: {
                parking_transactions_vechile: "required|max:5|in:"+typeParking.join(","),
                parking_transactions_number: "required|max:12",
                parking_transactions_discount: "required|number"
            },
        }
    }

    static boot () {
        super.boot()
        this.addTrait('@provider:Lucid/SoftDeletes')
    }
}

module.exports = ParkingTransaction
