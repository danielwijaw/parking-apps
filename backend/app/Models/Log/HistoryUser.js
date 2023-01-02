'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class HistoryUser extends Model {
    static get connection () {
      return 'log'
    }

    static get incrementing () {
        return true
    }

    static get table () {
      return 'setup_log_activities'
    }

    static get primaryKey () {
      return 'setup_log_activities_id'
    }

    static get searchField (){
      return 'setup_log_activities_models'
    }

    static get hidden() {
      return ["updated_at", "deleted_at"];
    }

    static boot () {
        super.boot()
        this.addTrait('@provider:Lucid/SoftDeletes')

        this.addHook('beforeSave', (userInstance) => {
            userInstance.setup_log_activities_users = JSON.stringify(userInstance.setup_log_activities_users)
            userInstance.setup_log_activities_old_data = JSON.stringify(userInstance.setup_log_activities_old_data)
            userInstance.setup_log_activities_newest_data = JSON.stringify(userInstance.setup_log_activities_newest_data)
        })
    }
}

module.exports = HistoryUser
