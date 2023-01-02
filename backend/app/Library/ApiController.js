'use strict'

const ResponseHelper = require("../../app/Library/ResponseHelper")
const { validateAll } = use("Validator");
const modelData = use("App/Models/Token");
const Redis = use('Redis');
const HistoryUser = use("App/Models/Log/HistoryUser");
const WriteTmpLog = require("../Library/WriteTmpLog");
const moment = require('moment');

class ApiController{
    constructor() {
        this.modelData = modelData
        this.nameModel = "Token"
        this.relationsNameModel = this.nameModel;
        this.ResponseHelper = ResponseHelper;
        this.validateAll = validateAll;
        this.Redis = Redis;
        this.HistoryUser = HistoryUser;
        this.WriteTmpLog = WriteTmpLog;
        this.moment = moment;
    }

    async generateWhereModelData(listData, request){
        const requestList = request && request.split(';')
        if(requestList){
            for(var keyList in requestList){
                var where = requestList[keyList].split(':')
                if(where[0] && where[1] && where[2]){
                    listData.whereRaw(where[0]+' '+where[1]+' :find', {find: where[2]})
                }
                else if(where[0] && where[1]){
                    if(where[1] == 'isnull'){
                        listData.whereNull(where[0])
                    }else if(where[1] == 'isnotnull'){
                        listData.whereNotNull(where[0])
                    }else{
                        listData.whereRaw(where[0]+'::VARCHAR = :find', {find: where[1]})
                    }
                }else{

                }
            }
        }
    }

    async generateSearchNotIncludeModelData(listData, request){
        const requestList = request && request.split(';')
        if(requestList){
            for(var keyList in requestList){
                var search = requestList[keyList].split(':')
                if(search[0] && search[1]){
                    listData.whereRaw(search[0]+'::VARCHAR not ilike :term', {term: '%'+search[1]+'%'})
                }
            }
        }
    }

    async generateSearchModelDataOr(listData, request){
        const requestList = request && request.split(';')
        if(requestList){
            listData.where(function (){
                for(var keyList in requestList){
                    var search = requestList[keyList].split(':')
                    console.log(search)
                    if(search[0] && search[1]){
                        this.orWhereRaw('COALESCE('+search[0]+'::VARCHAR, \'\') ilike :term', {term: '%'+search[1]+'%'})
                    }
                }
            })
        }
    }

    async generateSearchModelData(listData, request){
        const requestList = request && request.split(';')
        if(requestList){
            for(var keyList in requestList){
                var search = requestList[keyList].split(':')
                if(search[0] && search[1]){
                    listData.whereRaw('COALESCE('+search[0]+'::VARCHAR, \'\') ilike :term', {term: '%'+search[1]+'%'})
                }
            }
        }
    }

    async generateRangeModelData(listData, request){
        const requestList = request && request.split(';')
        if(requestList){
            for(var keyList in requestList){
                var search = requestList[keyList].split(':')
                if(search[0] && search[1] && search[2]){
                    listData.whereRaw(search[0]+`::DATE >= DATE('`+search[1]+`') and `+search[0]+`::DATE <= DATE('`+search[2]+`') AND
                    1 = ?
                    `,[1])
                }
            }
        }
    }

    async generateNestedWhereModelData(listData, relations, request){
        const requestList = request && request.split(';')
        if(requestList){
            listData.whereHas(relations, (builder) => {
                for(var keyList in requestList){
                    var where = requestList[keyList].split(':')
                    if(where[0] && where[1]){
                        builder.whereRaw(where[0]+'::VARCHAR = :find', {find: where[1]})
                    }
                }
            })
        }
    }

    async generateNestedSearchModelData(listData, relations, request){
        const requestList = request && request.split(';')
        if(requestList){
            listData.whereHas(relations, (builder) => {
                for(var keyList in requestList){
                    var search = requestList[keyList].split(':')
                    if(search[0] && search[1]){
                        builder.whereRaw('COALESCE('+search[0]+'::VARCHAR, \'\') ilike :term', {term: '%'+search[1]+'%'})
                    }
                }
            })
        }
    }

    async generateNestedRangeModelData(listData, relations, request){
        const requestList = request && request.split(';')
        if(requestList){
            listData.whereHas(relations, (builder) => {
                for(var keyList in requestList){
                    var search = requestList[keyList].split(':')
                    if(search[0] && search[1] && search[2]){
                        listData.whereRaw(search[0]+`::DATE >= DATE('`+search[1]+`') and `+search[0]+`::DATE <= DATE('`+search[2]+`') AND
                        1 = ?
                        `,[1])
                    }
                }
            })
        }
    }

    async generateGroupByModelData(listData, request){
        const requestList = request && request.split(';')
        if(requestList){
            for(var keyList in requestList){
                var where = requestList[keyList].split(':')
                if(where[0] && where[1]){
                    listData.groupBy(where[0])
                }
            }
        }
    }

    async generateWhereHasModelData(listData, request){
        const requestList = request && request.split(';')
        if(requestList){
            for(var keyList in requestList){
                var where = requestList[keyList].split(':')
                if(where[0]){
                    listData.whereHas(where[0])
                }
            }
        }
    }

    async index({ auth, request, response }) {
        var page = request.get().page || 1+':'+20
        var page = page.split(':')

        var order = request.get().order || 'created_at:desc'
        var order = order.split(':')

        var search = request.get().search
        var where = request.get().where

        var groupBy = request.get().groupby
        var whereHas = request.get().wherehas

        var nestedSearch = request.get().nestedSearch
        var valNestedSearch = request.get().valNestedSearch

        const keyNameRedis = this.relationsNameModel+'indexpage'+page+order+search+where+groupBy+whereHas+nestedSearch+valNestedSearch;

        const storeDataRedis = await Redis.get(keyNameRedis)

        if (storeDataRedis) {
            return response.status(201).json(JSON.parse(storeDataRedis))
        }

        const relationsModels = this.modelData.relations;

        var listData = this.modelData.query()
        this.generateSearchModelData(listData, request.get().search)
        this.generateWhereModelData(listData, request.get().where)
        this.generateGroupByModelData(listData, request.get().groupby)
        this.generateWhereHasModelData(listData, request.get().wherehas)
        this.generateNestedSearchModelData(listData, nestedSearch, valNestedSearch)
        listData.orderBy(order[0], order[1] || 'desc')

        for(let keyRel in relationsModels){
            if(relationsModels[keyRel]){
                listData.with(relationsModels[keyRel])
            }
        }

        listData = await listData.paginate(page[0], page[1] || 20)

        await Redis.set(keyNameRedis, JSON.stringify(ResponseHelper({
            responseCode: 201,
            message: this.nameModel+" All",
            data: listData.toJSON()
        })))

        return response.status(201).json(ResponseHelper({
            responseCode: 201,
            message: this.nameModel+" All",
            data: listData.toJSON()
        }));
    }

    async show({ auth, params, response }) {

        const keyNameRedis = this.relationsNameModel+params.id+'showrow';

        const storeDataRedis = await Redis.get(keyNameRedis)

        if (storeDataRedis) {
            return response.status(201).json(JSON.parse(storeDataRedis))
        }

        const relationsModels = this.modelData.relations;

        // const findData = await this.modelData.find(params.id);
        var findData = this.modelData.query().where(this.modelData.primaryKey, params.id)
        for(let keyRel in relationsModels){
            if(relationsModels[keyRel]){
                findData.with(relationsModels[keyRel])
            }
        }
        findData = await findData.first()

        if (!findData) {
            return response.status(404).json(ResponseHelper({
                responseCode: 404,
                status: "false",
                message: this.nameModel+' Not Found',
            }));
        }

        await Redis.set(keyNameRedis, JSON.stringify(ResponseHelper({
            responseCode: 201,
            message: this.nameModel+" Row",
            data: findData
        })))

        return response.status(201).json(ResponseHelper({
            responseCode: 201,
            message: this.nameModel+" Row",
            data: findData
        }));
    }

    async destroy({ auth, params, response }) {
        const queryData = this.modelData.query().where(this.modelData.primaryKey, params.id);
        const findData = await queryData.first()
        if (!findData) {
            return response.status(404).json(ResponseHelper({
                responseCode: 404,
                status: "false",
                message: this.nameModel+' Not Found',
            }));
        }

        await findData.delete();

        const storeDataRedis = await Redis.scanStream({
            match: '*'+this.nameModel+'*',
            count: 100
        })

        storeDataRedis.on('data', function (resultKeys) {
            if (resultKeys.length) {
                Redis.unlink(resultKeys);
            }
        });

        const logUser = new HistoryUser();
        logUser.setup_log_activities_models = this.modelData.table
        logUser.setup_log_activities_activity = 'Remove Record'
        logUser.setup_log_activities_old_data = findData
        logUser.setup_log_activities_newest_data = findData
        await logUser.save()

        return response.status(201).json(ResponseHelper({
            responseCode: 201,
            message: this.nameModel+" success Deleted"
        }));
    }

    async storeBulk({auth, request, response}){
        const requestInsert = request.all();
        const requestInsertVal = this.modelData.fillable().created;
        if(!requestInsert["0"]){
            return response.status(406).json(
                ResponseHelper({
                    responseCode: 406,
                    status: "false",
                    message: 'Post Data is not array.',
                    error: {
                        message: "Post Data is not array.",
                        stack: "Post Data is not array."
                    }
                })
            )
        }
        const rules = this.modelData.validator().created;
        var validationBulkInsert = {}
        var validationBulkRules = {}
        var insertValues = []
        var numbersLoop = 0;
        for(var keyReIn in requestInsert){
            insertValues.push({});
            for(var subKeyReIn in requestInsert[keyReIn]){
                if(requestInsertVal.find(element => element == subKeyReIn)){
                    insertValues[numbersLoop][subKeyReIn] = requestInsert[keyReIn][subKeyReIn];
                    validationBulkInsert[subKeyReIn+"_"+keyReIn] = requestInsert[keyReIn][subKeyReIn]
                }
            }
            for(var keyRul in rules){
                validationBulkRules[keyRul+"_"+keyReIn] = rules[keyRul]
            }
            numbersLoop += 1;
        }
        const validation = await validateAll(validationBulkInsert, validationBulkRules);
        if (validation.fails()) {
            await WriteTmpLog({
                directoryLog: 'error/',
                nameLog: 'error-log',
                fileData: {
                    date: new Date(),
                    requestUrl: request.url(),
                    userRequest: {
                        ip: request.ip()+" || "+request.ips(),
                        hostname: request.hostname(),
                        originalUrl: request.originalUrl(),
                        method: request.method(),
                        header: {
                        "User-Agent": request.header('User-Agent'),
                        Host: request.header('User-Agent'),
                        Authorization: request.header('Authorization'),
                        "Content-Type": request.header('Content-Type'),
                        Accept: request.header('Accept')
                        },
                        body: request.all()
                    },
                    errorMessage: validation.messages(),
                    errorName: 'Error Validations',
                    errorStack: validation.messages()
                }
            })

            return response.status(400).json(
                ResponseHelper({
                    responseCode: 400,
                    status: "false",
                    message: 'Some Error in Validation',
                    error: {
                        message: validation.messages(),
                        stack: validation.messages()
                    }
                })
            )
        }

        const processInsert = await this.modelData.createMany(insertValues);

        const storeDataRedis = await Redis.scanStream({
            match: '*'+this.nameModel+'*',
            count: 100
        })

        storeDataRedis.on('data', function (resultKeys) {
            if (resultKeys.length) {
                Redis.unlink(resultKeys);
            }
        });

        const logUser = new HistoryUser();
        logUser.setup_log_activities_models = this.modelData.table
        logUser.setup_log_activities_activity = 'Added New Record (Bulk)'
        logUser.setup_log_activities_old_data = processInsert
        logUser.setup_log_activities_newest_data = processInsert
        await logUser.save()

        return response.status(201).json(ResponseHelper({
            responseCode: 201,
            message: this.nameModel+" success Bulk Insert",
            data: processInsert
        }));
    }

    async store({ auth, request, response }) {
        const rules = this.modelData.validator().created;
        const validation = await validateAll(request.all(), rules);
        if (validation.fails()) {
            await WriteTmpLog({
                directoryLog: 'error/',
                nameLog: 'error-log',
                fileData: {
                    date: new Date(),
                    requestUrl: request.url(),
                    userRequest: {
                        ip: request.ip()+" || "+request.ips(),
                        hostname: request.hostname(),
                        originalUrl: request.originalUrl(),
                        method: request.method(),
                        header: {
                        "User-Agent": request.header('User-Agent'),
                        Host: request.header('User-Agent'),
                        Authorization: request.header('Authorization'),
                        "Content-Type": request.header('Content-Type'),
                        Accept: request.header('Accept')
                        },
                        body: request.all()
                    },
                    errorMessage: validation.messages(),
                    errorName: 'Error Validations',
                    errorStack: validation.messages()
                }
            })

            return response.status(400).json(
                ResponseHelper({
                    responseCode: 400,
                    status: "false",
                    message: 'Some Error in Validation',
                    error: {
                        message: validation.messages(),
                        stack: validation.messages()
                    }
                })
            )
        }

        var listData = request.only(this.modelData.fillable().created);

        if(auth.user && this.modelData.fillable().created.includes('created_by')){
            listData.created_by = auth.user.users_employees_id
        }

        const processInsert = await this.modelData.create(listData);

        const storeDataRedis = await Redis.scanStream({
            match: '*'+this.nameModel+'*',
            count: 100
        })

        storeDataRedis.on('data', function (resultKeys) {
            if (resultKeys.length) {
                Redis.unlink(resultKeys);
            }
        });

        const logUser = new HistoryUser();
        logUser.setup_log_activities_models = this.modelData.table
        logUser.setup_log_activities_activity = 'Added New Record'
        logUser.setup_log_activities_old_data = processInsert
        logUser.setup_log_activities_newest_data = processInsert
        await logUser.save()

        return response.status(201).json(ResponseHelper({
            responseCode: 201,
            message: this.nameModel+" success Created",
            data: processInsert
        }));
    }

    async update({ auth, params, request, response }) {
        const rules = this.modelData.validator((params && params.id)).updated;
        const validation = await validateAll(request.all(), rules);
        if (validation.fails()) {
            await WriteTmpLog({
                directoryLog: 'error/',
                nameLog: 'error-log',
                fileData: {
                    date: new Date(),
                    requestUrl: request.url(),
                    userRequest: {
                        ip: request.ip()+" || "+request.ips(),
                        hostname: request.hostname(),
                        originalUrl: request.originalUrl(),
                        method: request.method(),
                        header: {
                        "User-Agent": request.header('User-Agent'),
                        Host: request.header('User-Agent'),
                        Authorization: request.header('Authorization'),
                        "Content-Type": request.header('Content-Type'),
                        Accept: request.header('Accept')
                        },
                        body: request.all()
                    },
                    errorMessage: validation.messages(),
                    errorName: 'Error Validations',
                    errorStack: validation.messages()
                }
            })

            return response.status(400).json(
                ResponseHelper({
                    responseCode: 400,
                    status: "false",
                    message: 'Some Error in Validation',
                    error: {
                        message: validation.messages(),
                        stack: validation.messages()
                    }
                })
            )
        }

        const listData = request.only(this.modelData.fillable().updated);

        var findData = await this.modelData.find(params.id);

        if (!findData) {
            return response.status(404).json(ResponseHelper({
                responseCode: 404,
                status: "false",
                message: this.nameModel+' Not Found',
            }));
        }

        const logOldData = findData.toJSON()

        for(var keyListData in listData){
            findData[keyListData] = listData[keyListData]
        }

        if(auth.user && this.modelData.fillable().updated.includes('updated_by')){
            findData.updated_by = auth.user.users_employees_id
        }

        await findData.save();

        const storeDataRedis = await Redis.scanStream({
            match: '*'+this.nameModel+'*',
            count: 100
        })

        storeDataRedis.on('data', function (resultKeys) {
            if (resultKeys.length) {
                Redis.unlink(resultKeys);
            }
        });

        const logUser = new HistoryUser();
        logUser.setup_log_activities_models = this.modelData.table
        logUser.setup_log_activities_activity = 'Update Record'
        logUser.setup_log_activities_old_data = logOldData
        logUser.setup_log_activities_newest_data = {findData, listData}
        await logUser.save()

        return response.status(201).json(ResponseHelper({
            responseCode: 201,
            message: this.nameModel+" success Updated",
            data: findData
        }));
    }

    async count({ auth, params, request, response }) {

        var date_start = request.get().date_start || moment().tz("Asia/Jakarta").subtract(1, 'months').format('YYYY-MM-DD')

        var date_stop = request.get().date_stop || moment().tz("Asia/Jakarta").format('YYYY-MM-DD')

        const keyNameRedis = this.relationsNameModel+params.id+date_start+date_stop+'count';

        const storeDataRedis = await Redis.get(keyNameRedis)

        if (storeDataRedis) {
            return response.status(201).json(JSON.parse(storeDataRedis))
        }

        var findData = this.modelData.query()
        .whereRaw(`
        DATE(created_at) >= DATE('`+date_start+`') and DATE(created_at) <= DATE('`+date_stop+`') AND
        1 = ?
        `,[1]);
        this.generateSearchModelData(findData, request.get().search)
        this.generateWhereModelData(findData, request.get().where)
        this.generateGroupByModelData(findData, request.get().groupby)
        this.generateWhereHasModelData(findData, request.get().wherehas)

        findData = await findData.count()


        await Redis.set(keyNameRedis, JSON.stringify(ResponseHelper({
            responseCode: 201,
            message: this.nameModel+" countType",
            data: findData
        })))

        return response.status(201).json(ResponseHelper({
            responseCode: 201,
            message: this.nameModel+" countType from "+date_start+" to "+date_stop,
            data: findData
        }));
    }
}

module.exports = ApiController
