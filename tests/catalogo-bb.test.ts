import { Glob } from 'bun'
import { expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import path from 'path'
import { ProcessorFactory } from '../src/processors/processor.factory'
import { getTextFromFile } from '../src/utils'

const glob = new Glob("*.{pdf,PDF}")

const cwd = './temp/catalogo/BB'

const files = await Array.fromAsync(glob.scan(
    {
        cwd: cwd,
        // absolute: true
    }
))

test.each(files)('catalog BB "%s"', async (file) => {
    const filePath = path.join(cwd, file)

    const fileBuffer = readFileSync(filePath)

    const text = await getTextFromFile(fileBuffer)

    const processor = ProcessorFactory.make('bb')

    const isBB = processor.validate(text)

    
    const data = await processor.handle(text)

    if(data.length == 0) {
        await writeFile('temp/fail-'+file+'.txt', text);
    }

    console.log(data.length)

    expect(data).not.toBeArrayOfSize(0)

    expect(isBB).toBeTrue()

})