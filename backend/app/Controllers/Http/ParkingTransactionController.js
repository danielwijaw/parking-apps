'use strict'

const ParkingTransaction = use("App/Models/ParkingTransaction");
const ApiController = require("../../../app/Library/ApiController");

class ParkingTransactionController extends ApiController  {
    constructor() {
        super()
        this.modelData = ParkingTransaction;
        this.nameModel = "Parking Transaction List";
        this.relationsNameModel = this.nameModel;
    }
}

module.exports = ParkingTransactionController
