'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const StaticType = require('./ParkingStaticData')

const typeParking = StaticType.typeVechile
const moment = require("moment")

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
                "parking_transactions_out",
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
                parking_transactions_vechile: "max:5|in:"+typeParking.join(","),
                parking_transactions_number: "max:12",
                parking_transactions_discount: "number",
                parking_transactions_out: "in:now"
            },
        }
    }

    static boot () {
        super.boot()
        this.addTrait('@provider:Lucid/SoftDeletes')

        this.addHook('beforeUpdate', async (userInstance) => {

          userInstance.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
          userInstance.parking_transactions_in = moment(userInstance.parking_transactions_in).format('YYYY-MM-DD HH:mm:ss');
          const parking_transactions_out = moment().format('YYYY-MM-DD HH:mm:ss');

          if(userInstance.parking_transactions_out == "now"){
            const [statusPrice, returnPrice] = StaticType.countPrice({
              typeVechile: userInstance.parking_transactions_vechile,
              startDate: userInstance.parking_transactions_in,
              endDate: parking_transactions_out
            })

            if(statusPrice){
              userInstance.parking_transactions_price = returnPrice
              userInstance.parking_transactions_total = userInstance.parking_transactions_price - userInstance.parking_transactions_discount
            }

            userInstance.parking_transactions_out = parking_transactions_out;

          }

        })

        this.addHook('beforeCreate', async (userInstance) => {
          userInstance.parking_transactions_in = moment().format('YYYY-MM-DD HH:mm:ss');
          userInstance.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
          userInstance.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
        })

    }
}

module.exports = ParkingTransaction
