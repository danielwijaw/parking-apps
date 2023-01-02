'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Ws = use('Ws');

class TimeQueue extends Model {

    static get incrementing () {
        return true
    }
    
    static get table () {
      return 'queue_hospital'
    }
  
    static get primaryKey () {
      return 'queue_hospital_id'
    }

    static get searchField (){
      return 'queue_hospital_noted'
    }

    static get hidden() {
      return ["created_at", "updated_at", "deleted_at"];
    }

    static fillable(){
        return {
            created: [
            ],
            updated: [
            ],
        }
    }

    static validator(){
        return {
            created: {
            },
            updated: {
            },
        }
    }

    static boot () {
        super.boot()
        this.addTrait('@provider:Lucid/SoftDeletes')

        this.addHook('beforeCreate', async (userInstance) => {
            const getQueue = await TimeQueue.query()
            .where('queue_hospital_queue_polyclinics', userInstance.queue_hospital_queue_polyclinics)
            .first();
            if(getQueue){
                throw new Error('Time Queue its Exists - '+userInstance.queue_hospital_queue_polyclinics);
            }
        })

        this.addHook('afterCreate', (userInstance) => {

            const topic = Ws.getChannel('queue-hospital').topic('queue-hospital')
            if(topic){
                topic.broadcast('queueHospitalUpdate', {
                    to: "/topics/notifications_queue_hospital_sirus",
                    notification: {
                        title:"SIRUS Queue Hospital"
                    },
                    data: {
                        key_queue: "Queue Hospital"
                    }
                })
            }

        })

        this.addHook('afterUpdate', (userInstance) => {

            const topic = Ws.getChannel('queue-hospital').topic('queue-hospital')
            if(topic){
                topic.broadcast('queueHospitalUpdate', {
                    to: "/topics/notifications_queue_hospital_sirus",
                    notification: {
                        title:"SIRUS Queue Hospital"
                    },
                    data: {
                        key_queue: "Queue Hospital"
                    }
                })
            }

        })
    }
}

module.exports = TimeQueue
