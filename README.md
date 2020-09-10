# smurf-workers
A lightweight, beginner friendly, reusable worker module supporting multiple job types, including job queues and automatic job distribution across idle workers. Written to abstract away cumbersome Node.js Worker setup to bare minimum. It's also dependency-free.

### Installation
```sh
$ npm install -S 'smurf-workers'
```

### Prerequisites
This module is a lightweight wrapper around Node.js Worker class, which requires **Node.js v12** or greater (LTS at this time). You could also try to run it on **Node v10** with **--experimental-worker flag**.

### Instance Setup

It's best to create an instance it in a separate file and require as needed:

###### **`workers.js`**
```sh
const path = require('path')
const jobFolderName = 'workerJobs'
const SmurfWorkers = require('./SmurfWorkers')
const smurfWorkers = new SmurfWorkers({
    jobPath: path.join(__dirname, jobFolderName),
    log: console.log
})
module.exports = smurfWorkers
```

Constructor takes a **jobPath**, an absolute file path to jobs you'll create later. Optional **log** param takes in a log function. Log function should handle **strings** as well as **objects**

### Usage
To spawn a **single worker**, or a **worker pool**, provide a string with job name. Job name should be the same as file name in **jobPath**, specified in previous step:
```sh
const smurfWorkers = require('./workers')   // workers.js from previous step
smurfWorkers.spawn('processImage', 3)       // spawn 3 workers to resize images
smurfWorkers.spawn('addWatermark')          // spawn 1 worker to add watermarks
```
From now on, workers await to do your bidding. To queue a job, provide job name and job details:
```sh
smurfWorkers.smurf('processImage', { src: './input/tree.jpg', dest: './output/tree.jpg' })
smurfWorkers.smurf('addWatermark', { src: './output/cat.jpg', dest: './output/cat.jpg' })
```
This will add jobs to the queue. The job will be assigned immediately, if any worker in the given field is idle (the queue is empty). If not, it will be assigned as soon as workers are done with previously assigned workload. Workload will be evenly distributed across workers.

### Creating Jobs
Jobs are just functions, exported from separate file in jobPath (specified in instance setup step). File names should be the same as job names you provide in smurfWorker.spawn function (without .js extension). Job functions should also take job details, onError and whenDone callbacks as arguments. Order is important. Let's take 'processImage.js' job, shown in previous step, for example:

###### **`processImage.js`**
```sh
const sharp = require('sharp')
sharp.cache(false)

module.exports = function processImage({ src, dest }, onError, whenDone) {
	sharp(src)
		.rotate()
		.resize(1024, 810)
		.jpeg({ quality: 50 })
		.toFile(dest, function (err, info) {
			if (err) onError(err)
			whenDone()
		}) 
}
```

This job uses sharp to resize and compress images. Notice the use of job detalis ({ src, dest }), which is the object we passed to smurfWorkers.spawn in previous step. This way, you can pass any basic data to your worker. Also, notice the use of onError and whenDone. whenDone is called when worker is ready to be marked as idle.

### License
Free to use any way you like.