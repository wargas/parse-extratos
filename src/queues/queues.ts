import { Queue, Worker } from "bullmq";
import { redis } from "../redis";
import { JobProcess } from "./job";

const QUEUE_NAME = 'process'

const queueProcess = new Queue(QUEUE_NAME, {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    }
})

const workerProcess = new Worker(
    QUEUE_NAME,
    JobProcess,
    {
        connection: redis,
        autorun: false
    }
)

export { queueProcess, workerProcess };
