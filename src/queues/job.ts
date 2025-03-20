import type { Job } from "bullmq";
import { sleep } from "bun";
import { logger } from "../logger";
import { clientS3 } from "../s3";
import { redis } from "../redis";
import { trigger } from "../pusher";

type DataType = {
    template: string,
    files: string[],
    id: string
}

export async function JobProcess(job: Job<DataType>) {

    await redis.set(`status:${job.id}`, 'processing')
    await trigger(`status:${job.id}`, 'processing')

    logger.info(`Starting JOB`)

    const data = job.data;

    for await (let fileName of data.files) {
        const files3 = clientS3.file(fileName)
        if (await files3.exists()) {
            // await files3.delete()
            logger.info(`Deleted file ${fileName}`)
        } else {
            logger.warn(`File not found ${fileName}`)
        }
    }

    await redis.set(`status:${job.id}`, 'completed')
    await trigger(`status:${job.id}`, 'completed')

    logger.info(`JOB finalized`)
}