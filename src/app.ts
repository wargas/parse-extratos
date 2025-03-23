import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastify from "fastify";


const app = fastify({
    logger: false
})

app.register(fastifyMultipart, {
    limits: {
        fileSize: 1000000000
    }
})

app.register(fastifyCors, {
    origin: '*',
    allowedHeaders: '*'
})

export { app };
