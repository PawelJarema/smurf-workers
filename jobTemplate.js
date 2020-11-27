const { MSG_DONE, MSG_ERR, MSG } = require('./constants')
const { parentPort, workerData } = require('worker_threads')
const { id, job, jobPath } = workerData
const jobFunction = require(jobPath)
const onError = (msg) => parentPort.postMessage({ status: MSG_ERR, id, jobName: job, msg })
const whenDone = (msg) => parentPort.postMessage({ status: MSG_DONE, id, jobName: job, msg })
const log = (msg) => parentPort.postMessage({ time: new Date().toString(), status: MSG, id, jobName: job, msg })
parentPort.on('message', jobDetails => {
    try {
        jobFunction(jobDetails, onError, whenDone, log)
    } catch (err) {
        onError(err)
    }
})