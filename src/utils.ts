import PDF from "./pdf.js/parse";
import { clientS3 } from "./s3";

export function toFloat(str: string) {
    return parseFloat(str.replaceAll('.', '').replaceAll(',', '.'));
}

export function parseData(str: string) {
    return str.replace(/(\d\d)\/(\d\d)\/(\d\d\d\d)/, "$3-$2-$1")
}

export async function getText(s3_path:string) {
    const file = clientS3.file(s3_path);

    const fileData = await file.arrayBuffer() 

    const { text } = await PDF(new Uint8Array(fileData))

    return text
}