import fs from 'fs';
import module from 'node:module';
import { join } from 'node:path';
import url from 'node:url';
import { getDocument, type PDFPageProxy } from "pdfjs-dist";
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { logger } from './logger';



process.getBuiltinModule = (moduleName: string) => {

    switch (moduleName) {
        case 'fs':
            return fs;
        case 'url':
            return url;
        case 'module':
            return module;
        default:
            return fs;
    }

}

export default async function PDF(data: Uint8Array) {

    const document = await getDocument({
        data,
        standardFontDataUrl: join(__dirname, '..', 'node_modules/pdfjs-dist/standard_fonts/')
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
        .map((_, i) => i + 1)

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

    const items = content.items.map((item) => {
        const { str, transform, height, width } = item as TextItem

        logger.info('str: ', str)

        return {
            y: transform[5],
            x: transform[4],
            h: height,
            w: width,
            str,
        }
    })

    for (let item of items) {

        if (lastY == item.y || !lastY) {
            text += item.str;
        }
        else {
            text += '\n'  + item.str;
        }
        lastY = item.y;
    }

    return text;

}

declare global {
    namespace NodeJS {
        interface Process {
            getBuiltinModule(str: string): any
        }
    }
}