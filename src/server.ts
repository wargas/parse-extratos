import { app } from "./app";
import { logger } from "./logger";
import { workerProcess } from "./queues/queues";
import './routes';

app.listen({
    port: parseInt(process.env.PORT),
    host: '0.0.0.0'
})

workerProcess.run()

workerProcess.on('ready', () => {
    logger.info('Worker ready')
})

app.server.on('listening', async () => {

    const {port} = app.server.address() as any

    logger.info(`Running on port ${port}`)
    
})

app.server.on('request', req => {
    logger.info(`Request: ${req.method} ${req.url}`)
})

app.server.on('error', err => {
    logger.error(err, 'Server Error Ocurred')
})

