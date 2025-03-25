import { test } from 'bun:test'
import fs from 'fs'
import { ProcessorFactory } from '../src/processors/processor.factory'
import { getTextFromS3 } from '../src/utils'

test('mpgao', async () => {
    const text = await getTextFromS3('modelos/mpago1.pdf')

    const factory = ProcessorFactory.make('mpago')

    const lines = await factory.handle(text)

    await fs.promises.writeFile('temp/mpgago-lines.txt', JSON.stringify(lines, null, 4))
})