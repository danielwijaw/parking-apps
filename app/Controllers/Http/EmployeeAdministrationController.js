'use strict'

const EmployeeAdministration = use("App/Models/EmployeeAdministration");
const ApiController = require("../../../app/Library/ApiController");
const Redis = use('Redis');
const fs = require('fs');

class EmployeeAdministrationController extends ApiController  {
    constructor() {
        super()
        this.modelData = EmployeeAdministration;
        this.nameModel = "Employee Administration List";
        this.relationsNameModel = this.nameModel;
    }

    async store({ auth, request, response }) {
        const rules = this.modelData.validator().created;
        const fileInput = request.only(this.modelData.fillable().created);
        fileInput[this.modelData.fillable().files[0]] = request.file(this.modelData.fillable().files[0]);
        const validation = await this.validateAll(fileInput, rules);
        if (validation.fails()) {
            await this.WriteTmpLog({
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
                this.ResponseHelper({
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

        const bufferFile = fs.readFileSync(fileInput[this.modelData.fillable().files[0]].tmpPath);

        fileInput[this.modelData.fillable().storeFile[0]] = fileInput[this.modelData.fillable().files[0]];

        fileInput[this.modelData.fillable().files[0]] = bufferFile;

        const processInsert = await this.modelData.create(fileInput);

        const storeDataRedis = await Redis.scanStream({
            match: '*'+this.nameModel+'*',
            count: 100
        })

        storeDataRedis.on('data', function (resultKeys) {
            if (resultKeys.length) {
                Redis.unlink(resultKeys);
            }
        });

        processInsert[this.modelData.fillable().files[0]] = "";

        const usersId = auth.user.users_employees_id;
        const employeeData = await this.EmployeeModels.getRowData(usersId);

        const logUser = new this.HistoryUser();
        logUser.setup_log_activities_models = this.modelData.table
        logUser.setup_log_activities_activity = 'Added New Record'
        logUser.setup_log_activities_users = employeeData
        logUser.setup_log_activities_old_data = processInsert
        logUser.setup_log_activities_newest_data = processInsert
        await logUser.save()

        return response.status(201).json(this.ResponseHelper({
            responseCode: 201,
            message: this.nameModel+" success Created",
            data: processInsert
        }));
    }

    async update({ auth, params, request, response }) {
        const rules = this.modelData.validator().updated;
        const fileInput = request.only(this.modelData.fillable().created);
        fileInput[this.modelData.fillable().files[0]] = request.file(this.modelData.fillable().files[0]);
        const validation = await this.validateAll(fileInput, rules);
        if (validation.fails()) {
            await this.WriteTmpLog({
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
                this.ResponseHelper({
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

        const bufferFile = fs.readFileSync(fileInput[this.modelData.fillable().files[0]].tmpPath);

        fileInput[this.modelData.fillable().storeFile[0]] = fileInput[this.modelData.fillable().files[0]];

        fileInput[this.modelData.fillable().files[0]] = bufferFile;

        const findData = await this.modelData.find(params.id);

        if (!findData) {
            return response.status(404).json(this.ResponseHelper({
                responseCode: 404,
                status: "false",
                message: this.nameModel+' Not Found',
            }));
        }

        for(var keyListData in fileInput){
            findData[keyListData] = fileInput[keyListData]
        }

        const listData = findData;
    
        await findData.save();

        const storeDataRedis = await Redis.scanStream({
            match: '*'+this.nameModel+'*',
            count: 100
        })

        const usersId = auth.user.users_employees_id;
        const employeeData = await this.EmployeeModels.getRowData(usersId);

        const logUser = new this.HistoryUser();
        logUser.setup_log_activities_models = this.modelData.table
        logUser.setup_log_activities_activity = 'Update Record'
        logUser.setup_log_activities_users = employeeData
        logUser.setup_log_activities_old_data = listData
        logUser.setup_log_activities_newest_data = findData
        await logUser.save()

        storeDataRedis.on('data', function (resultKeys) {
            if (resultKeys.length) {
                Redis.unlink(resultKeys);
            }
        });

        return response.status(201).json(this.ResponseHelper({
            responseCode: 201,
            message: this.nameModel+" success Updated",
            data: findData
        }));
    }

    async showData({ auth, params, response }) {

        const keyNameRedis = this.nameModel+params.id+'showrowdata';

        const storeDataRedis = await Redis.get(keyNameRedis)

        if (storeDataRedis) {
            const parseStoreDataRedis = JSON.parse(storeDataRedis)
            return response.type(parseStoreDataRedis["content-type"]).send(Buffer.from(parseStoreDataRedis.fileData, 'base64'))
        }

        const findData = await this.modelData.find(params.id);

        if (!findData) {
            return response.status(404).json(this.ResponseHelper({
                responseCode: 404,
                status: "false",
                message: this.nameModel+' Not Found',
            }));
        }

        await Redis.set(keyNameRedis, JSON.stringify({
            "content-type": findData[this.modelData.fillable().storeFile[0]].headers["content-type"],
            fileData: findData[this.modelData.fillable().files[0]].toString('base64')
        }))

        return response.type(findData[this.modelData.fillable().storeFile[0]].headers["content-type"]).send(findData[this.modelData.fillable().files[0]])
    }
}

module.exports = EmployeeAdministrationController
