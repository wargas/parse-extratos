import type { Job } from "bullmq";
import { sleep } from "bun";
import { logger } from "../logger";
import { clientS3 } from "../s3";

type DataType = {
    template: string,
    files: string[]
}

export async function JobProcess(job: Job<DataType>) {

    await sleep(5000)

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

    logger.info(`JOB finalized`)
}