import PDF from "./parse-pdf";
import { clientS3 } from './s3';

const f = clientS3.file('modelos/bb1.pdf')

const fileData = await f.arrayBuffer() 

const data = await PDF(new Uint8Array(fileData))

console.log(data.text) 

