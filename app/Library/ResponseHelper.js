'use strict'

const metadataVersion = require("./../../metadata.json")
const moment = require("moment")

module.exports = function(params = {}){
    var returnJson = {
        responseCode: 200,
        status: true,
        message: "",
        data: [],
        error: null
    }

    for(var keyParams in params){
        for(var keyJson in returnJson){
            if(keyParams == keyJson && params[keyParams]){
                returnJson[keyJson] = params[keyParams]
            }
        }
    }

    return {
        head: {
            applicationVersion: metadataVersion.buildMajor+"."+metadataVersion.buildMinor+"."+metadataVersion.buildRevision,
            responseCode: returnJson.responseCode,
            message: returnJson.message,
            returnDate: new Date(),
            date: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")
        },
        body: {
            status: String(returnJson.status),
            message: returnJson.message,
            data: returnJson.data
        },
        error: returnJson.error
    }
}