'use strict'
const HistoryUser = use("App/Models/Log/HistoryUser");
const ResponseHelper = require("../../../../app/Library/ResponseHelper");
const { validateAll } = use("Validator");

class HistoryRecordController {

    async checkHistoryCreated({ auth, request, response }){
        const rules = {
            'uuid':"required|uuid",
            'tables':"required"
        }
        const validation = await validateAll(request.all(), rules);
        if (validation.fails()) {
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

        const findRecord = await HistoryUser.query().select('created_at', 'setup_log_activities_old_data').where('setup_log_activities_models', request.all().tables).where('setup_log_activities_activity', 'Added New Record').whereRaw('setup_log_activities_old_data::varchar ilike \'%'+request.all().uuid+'%\' ').first();

        if(!findRecord){
            return response.status(400).json(
                ResponseHelper({
                    responseCode: 400,
                    status: "false",
                    message: 'Data Log is Not Found',
                    error: {
                        message: 'Data Log is Not Found',
                        stack: 'Data Log is Not Found'
                    }
                })
            )
        }

        return response.status(201).json(ResponseHelper({
            responseCode: 201,
            message: "Log Created Data View Users (Created)",
            data: findRecord
        }));
    }

    async checkHistoryRemoved({ auth, request, response }){
        const rules = {
            'uuid':"required|uuid",
            'tables':"required"
        }
        const validation = await validateAll(request.all(), rules);
        if (validation.fails()) {
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

        const findRecord = await HistoryUser.query().select('created_at', 'setup_log_activities_old_data').where('setup_log_activities_models', request.all().tables).where('setup_log_activities_activity', 'Remove Record').whereRaw('setup_log_activities_old_data::varchar ilike \'%'+request.all().uuid+'%\' ').first();

        if(!findRecord){
            return response.status(400).json(
                ResponseHelper({
                    responseCode: 400,
                    status: "false",
                    message: 'Data Log is Not Found',
                    error: {
                        message: 'Data Log is Not Found',
                        stack: 'Data Log is Not Found'
                    }
                })
            )
        }

        return response.status(201).json(ResponseHelper({
            responseCode: 201,
            message: "Log Created Data View Users (Removed)",
            data: findRecord
        }));
    }

}

module.exports = HistoryRecordController
