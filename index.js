const { MSG_DONE, MSG_ERR } = require('./constants')
const { Worker } = require('worker_threads')
const path = require('path')
class SmurfWorkers {
    constructor ({ jobPath, log }) {
        if (typeof jobPath !== 'string') throw new Error('jobPath required')
        this._jobPath = jobPath
        this._log = log
        this._tasks = {}
        this._smurfs = []
        this._smurfsAvailable = {}
    }

    log (text) {
        typeof this._log === 'function' && this._log(text)
    }

    spawn (jobName, number = 1) {
        if (typeof jobName !== 'string') throw new Error('job name required')
        if (!this._smurfsAvailable[jobName]) this._smurfsAvailable[jobName] = []

        for (let i = 0; i < number; i++) {
            const id = this._smurfs.length
            const smurf = new Worker
                (path.join(__dirname, 'jobTemplate.js'),
                { workerData: { id, job: jobName, jobPath: path.join(this._jobPath, jobName) }}
            )

            smurf.on('message', message => {
                if (message.status) {
                    const { status, id, jobName } = message
                    switch (status) {
                        case MSG_DONE:
                            this.log(`Smurf ${id} is done smurfing ${jobName}. Idle.`)
                            this._smurfsAvailable[jobName].push(id)
                            this.nextTask(jobName)
                            break
                        case MSG_ERR:
                            this.log(`Smurf ${id} errored out smurfing ${jobname}`)
                            this._smurfsAvailable[jobName].push(id)
                            this.nextTask(jobName)
                            break
                        default:
                            this.log(`Unknown message status: ${status}`)
                    }
                } else {
                    this.log({ message })
                }
            })

            smurf.on('error', code => {
                this.log(`Critical error. Lost Smurf ${id} with code ${code} on ${jobName}`)
                throw new Error(`Smurf exited with ${code} code.`)
            })

            smurf.on('exit', code => {
                if (code !== 0) {
                    this.log(`Lost Smurf ${id} on exit. Code ${code}`)
                } else {
                    this.log(`Smurf ${id} exited properly`)
                }
            })

            this._smurfsAvailable[jobName].push(id)
            this._smurfs.push(smurf)
            this.log(`Smurf ${id} spawned to ${jobName}.`)
        }
    }

    nextTask (jobName) {
        if (!this._tasks[jobName] || !this._tasks[jobName].length) return
        if (this._smurfsAvailable[jobName] && this._smurfsAvailable[jobName].length) {
            const jobDetails = this._tasks[jobName].pop()
            const id = this._smurfsAvailable[jobName].pop()
            const smurf = this._smurfs[id]
            this.log(`Assigning ${jobName} task to Smurf ${id}.`)
            smurf.postMessage(jobDetails)
        }
    }

    smurf (jobName, jobDetails) {
        if (!this._smurfsAvailable[jobName]) throw new Error(`No Smurf capable of ${jobName}.`)
        if (this._tasks[jobName]) {
            this._tasks[jobName].push(jobDetails)
        } else {
            this._tasks[jobName] = [jobDetails]
        }
        this.nextTask(jobName)
    }

    cleanup () {
        if (!this._smurfs) return 
        for (let i = this._smurfs.length - 1; i >= 0; i--) {
            this._smurfs[i].terminate()
            this._smurfs.length = i
        }
    }
}

module.exports = SmurfWorkers