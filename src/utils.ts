import { stringify } from "csv-stringify/sync";
import PDF from "./parse-pdf";
import { clientS3 } from "./s3";

export function toFloat(str: string) {
    return parseFloat(str.replaceAll('.', '').replaceAll(',', '.'));
}

export function parseData(str: string) {
    return str.replace(/(\d\d)\/(\d\d)\/(\d\d\d\d)/, "$3-$2-$1")
}

export async function getTextFromS3(s3_path: string) {
    const file = clientS3.file(s3_path);

    const fileData = await file.arrayBuffer()

    const { text } = await PDF(new Uint8Array(fileData))

    return text
}


export async function getTextFromFile(fileData: Buffer) {

    const { text } = await PDF(new Uint8Array(fileData))

    return text
}

export class CSV {
    static stringfy(data:any) {

        return stringify(data, {
            header: true,
            // columns: Object.keys(data),
            delimiter: ';',
            cast: {
                number: value => value.toLocaleString('pt-BR', { maximumFractionDigits:2, minimumFractionDigits: 2})
            }
        })
    }
}