'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const NotificationsStaticData = use("App/Models/Log/NotificationStaticDatum");
const Ws = use('Ws');
const Redis = use('Redis')

class Notification extends Model {
    static get connection () {
      return 'log'
    }

    static get incrementing () {
        return true
    }
    
    static get table () {
      return 'notifications'
    }
  
    static get primaryKey () {
      return 'notifications_id'
    }

    static get searchField (){
      return 'notifications_type'
    }

    static get hidden() {
      return ["deleted_at", "updated_at"];
    }

    static fillable(){
        return {
            created: [
                "notifications_type",
                "notifications_text",
                "notifications_available_start",
                "notifications_available_end"
            ],
            updated: [
                "notifications_read"
            ],
        }
    }

    static validator(id){
        return {
            created: {
                notifications_type: "required|in:"+NotificationsStaticData.typeNotifications.join(),
                notifications_text: "required|max:300",
                notifications_available_start: "dateFormat:YYYY-MM-DD",
                notifications_available_end: "dateFormat:YYYY-MM-DD"
            },
            updated: {
                notifications_read: "required|in:true,false"
            },
        }
    }

    static boot () {
        super.boot()
        this.addTrait('@provider:Lucid/SoftDeletes')

        this.addHook('afterCreate', async (userInstance) => {

            const topic = Ws.getChannel('notifications').topic('notifications')
            if(topic){
                topic.broadcast('notifications-'+userInstance.notifications_type, {
                    to: "/notifications/all-"+userInstance.notifications_id,
                    notification: {
                        title: "Notifikasi",
                        body: "/notifications/all-"+userInstance.notifications_id
                    },
                    data: {
                        notification_id: userInstance.notifications_id,
                        key_notifications: userInstance.notifications_type,
                        // body_notifications: userInstance.notifications_text.substring(0, 40)+'.......',
                        body_notifications: userInstance.notifications_text,
                        available_start: userInstance.notifications_available_start,
                        available_end: userInstance.notifications_available_end,
                    }
                })
            }

            const storeDataRedis = await Redis.scanStream({
                match: '*Notification List*',
                count: 100
            })
    
            storeDataRedis.on('data', function (resultKeys) {
                if (resultKeys.length) {
                    Redis.unlink(resultKeys);
                }
            });

        })
    }
}

module.exports = Notification
