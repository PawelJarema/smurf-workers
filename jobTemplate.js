const { MSG_DONE, MSG_ERROR } = require('./constants')
const { parentPort, workerData } = require('worker_threads')
const { id, job, jobPath } = workerData
const jobFunction = require(jobPath)
const onError = (err) => parentPort.postMessage({ status: MSG_ERROR, body: err, id, jobName: job })
const whenDone = () => parentPort.postMessage({ status: MSG_DONE, id, jobName: job })
parentPort.on('message', jobDetails => {
    try {
        jobFunction(jobDetails, onError, whenDone)
    } catch (err) {
        onError(err)
    }
})