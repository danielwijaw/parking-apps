'use strict'

const moment = require('moment');
const Drive = use('Drive');

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports = async function(params = {}){
    var parameterDefault = {
        isNewFile: 'yes',
        isJson: 'yes',
        directoryLog: 'log/',
        nameLog: 'log',
        fileData: {}
    }

    for(var keyParams in params){
        for(var keyJson in parameterDefault){
            if(keyParams == keyJson && params[keyParams]){
                parameterDefault[keyJson] = params[keyParams]
            }
        }
    }

    parameterDefault.fileName = parameterDefault.directoryLog+moment().format('YYYY')+'/'+moment().format('YYYY-MM')+'/'+moment().format('YYYY-MM-DD')+'/'+parameterDefault.nameLog+'_'+moment().format('YYYY-MM-DD::HH')+'.json'

    const exists = await Drive.exists(parameterDefault.fileName)
    if(!exists){
      Drive.put(parameterDefault.fileName, JSON.stringify([parameterDefault.fileData], null, 4))
    }else{
      const FileLog = await Drive.get(parameterDefault.fileName)
        if (isJson(FileLog)){
            var ObjJson = JSON.parse(FileLog.toString('utf8'));
            ObjJson.push(parameterDefault.fileData)
            Drive.put(parameterDefault.fileName, JSON.stringify(ObjJson, null, 4))
        }else{
            var ObjJson = [];
            ObjJson.push(FileLog.toString('utf8'))
            ObjJson.push(parameterDefault.fileData)
            Drive.put(parameterDefault.fileName, JSON.stringify(ObjJson, null, 4))
        }
    }
}
