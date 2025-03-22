import path from 'path';
import { getDocument, type PDFPageProxy } from "pdfjs-dist";
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

export default async function PDF(data: Uint8Array) {
    const document = await getDocument({
        data,
        standardFontDataUrl: path.join(__dirname, 'standard_fonts/'),
    }).promise

    const ret = {
        numpages: 0,
        numrender: 0,
        info: null,
        metadata: null,
        text: "",
        version: null
    };

    ret.numpages = document.numPages

        
    let counter = document.numPages;

    const arrayPages = Array(counter)
        .fill("")
        .map((_, i) => i++)


    for await (const i of arrayPages) {
        try {
            let page = await document.getPage(i);
            const pageText = await page_renderer(page)

            ret.text = `${ret.text}\n\n${pageText}`
        } catch (error) {
            debugger;
        }
    }

    return ret;
}

export async function page_renderer(pageData: PDFPageProxy) {
    const content = await pageData.getTextContent({
        disableNormalization: true,
        includeMarkedContent: false
        // normalizeWhitespace: true,
        // disableCombineTextItems: true
    });

    let lastY, text = ''

    for (let _item of content.items) {

        const item = _item as TextItem
    
        if (lastY == item.transform[5] || !lastY) {
            text += item.str;
        }
        else {
            text += '\n' + item.str;
        }
        lastY = item.transform[5];
    }


    return text;

}