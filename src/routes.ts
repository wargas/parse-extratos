import { randomUUIDv7 } from "bun";
import type { Readable } from "stream";
import { app } from "./app";
import { queueProcess } from "./queues/queues";
import { clientS3 } from "./s3";
import { redis } from "./redis";

app.get('/', (_, res) => {

    // queueProcess.add('process', 1)

    res.send({ ok: true })
})

app.post('/upload', async (req, reply) => {

    const id = randomUUIDv7()

    const { template = 'stone' } = req.query as any

    const parts = req.files()

    const uploadedFiles: string[] = []

    for await (const part of parts) {
        const uploadedFile = await upload(part.file)

        uploadedFiles.push(uploadedFile)
    }

    queueProcess.add('process', { template, files: uploadedFiles })

    await redis.set(`status:${id}`, 'enqueued')

    reply.send({ id, template, files: uploadedFiles })

})

async function upload(src: Readable): Promise<string> {
    return new Promise((acc, rej) => {
        const fileName = randomUUIDv7() + '.pdf'
        const fileS3 = clientS3.file(fileName);

        const writer = fileS3.writer()

        src.on('data', chunk => {
            writer.write(chunk)
        })

        src.on('end', async () => {
            await writer.end()

            acc(fileName)
        })

        src.on('error', (error) => {
            rej(error)
        })
    })
}