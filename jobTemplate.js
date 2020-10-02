const { MSG_DONE, MSG_ERR, MSG } = require('./constants')
const { parentPort, workerData } = require('worker_threads')
const { id, job, jobPath } = workerData
const jobFunction = require(jobPath)
const onError = (err) => parentPort.postMessage({ status: MSG_ERR, body: err, id, jobName: job })
const whenDone = () => parentPort.postMessage({ status: MSG_DONE, id, jobName: job })
const log = (msg) => parentPort.postMessage({ status: MSG, id, jobName: job, msg })
parentPort.on('message', jobDetails => {
    try {
        jobFunction(jobDetails, onError, whenDone, log)
    } catch (err) {
        onError(err)
    }
})