'use strict'

const fs = require('fs');
const ResponseHelper = require("../../../app/Library/ResponseHelper")

class LogController {
    constructor() {
    }

    listDirectory({ auth, request, response }){

        function getFiles (dir, files_){
            files_ = files_ || [];
            var files = fs.readdirSync(dir);
            for (var i in files){
                var name = dir + '/' + files[i];
                if (fs.statSync(name).isDirectory()){
                    files_.push(request.url()+'?directory='+name);
                } else {
                    files_.push(request.url()+'read?file='+name);
                }
            }
            return files_;
        }

        const testFolder = request.get().directory || './tmp';

        const fileNow = getFiles(testFolder)

        return response.status(201).json(ResponseHelper({
            responseCode: 201,
            message: "Directory List "+testFolder,
            data: fileNow
        }));
    }

    readFile({ auth, request, response }){

        function getFiles (dir, files_){
            files_ = files_ || [];
            const files = fs.readFileSync(dir, 'utf8');
            return JSON.parse(files)
        }

        const testFolder = request.get().file || './tmp';

        const fileNow = getFiles(testFolder)

        return response.status(201).json(ResponseHelper({
            responseCode: 201,
            message: "File List "+testFolder,
            data: fileNow
        }));
    }
}

module.exports = LogController
