import { randomUUIDv7 } from "bun";
import type { Readable } from "stream";
import { app } from "./app";
import { logger } from "./logger";
import { ProcessorFactory } from "./processors/processor.factory";
import { queueProcess } from "./queues/queues";
import { redis } from "./redis";
import { clientS3 } from "./s3";
import { CSV, getTextFromFile } from "./utils";

app.get('/', (_, res) => {

    // queueProcess.add('process', 1)

    res.send({ ok: true })
})

app.get('/list', ()  => {
    return ProcessorFactory.list()
})

app.post('/direct', async (req, reply) => {
    const { template = 'stone' } = req.query as any

    const processor = ProcessorFactory.make(template)

    const file = await req.file()

    logger.info(file?.filename + ' uploaded')

    const buffer = await file?.toBuffer()
        
    if (!buffer) {
        throw new Error("FILE INVALID")
    }
    logger.info("buffer.length: "+buffer.length)

    const text = await getTextFromFile(buffer)

    if(!text) {
        throw new Error("NOT EXTRACTED TEXT")
    }

    const data = processor.handle(text)

    const filename = 'processados/' + randomUUIDv7().replace(/-/g, '') + '-' + file?.filename.replace('.pdf', '');

    
    const fileS3CSV = clientS3.file(filename + '.csv')
   
    await fileS3CSV.write(CSV.stringfy(data));

    const csv = fileS3CSV.presign({
        acl: 'public-read',
        expiresIn: 60 * 60
    })

    return { csv };

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