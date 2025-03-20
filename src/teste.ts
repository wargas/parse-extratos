import fs from 'fs/promises';
import PDF from "./pdf.js/parse";
import itauProcessor from "./processors/itau";
import { clientS3 } from './s3';

const f = clientS3.file('0195b011-25c3-7000-8b4f-8cabba2a0729.pdf')

const fileData = await f.arrayBuffer() 

const data = await PDF(new Uint8Array(fileData))

// await fs.writeFile('itau.txt', data.text); process.exit(0)

const extrato = await itauProcessor(data.text)

await fs.writeFile('itau.json', JSON.stringify(extrato, null,4)); process.exit(0)