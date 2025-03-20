import { S3Client } from "bun";

const clientS3 = new S3Client({
    accessKeyId: "7uQzueDfFbFEriMdScXL",
    secretAccessKey: "PzxWH7Q0bYJP56q3VaM2oQE4yKWpwF2myEsDJVTg",
    bucket: "sefin",
    endpoint: "https://s3-api.deltex.com.br",
})

export { clientS3 };
