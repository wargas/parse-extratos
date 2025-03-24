import { beforeAll, expect, test } from 'bun:test';
import { ProcessorFactory } from "../src/processors/processor.factory";
import { getTextFromS3 } from '../src/utils';

const processors = ProcessorFactory.list().map(p => p.id)

beforeAll(() => {})

const bindings = [
    { file: 'bb1', modelo: 'bb' },
    { file: 'bb2', modelo: 'bb' },
    { file: 'bb3', modelo: 'bb' },
    { file: 'bradesco1', modelo: 'bradesco' },
    { file: 'itau1', modelo: 'itau' },
    { file: 'itau2', modelo: 'itau' },
    { file: 'itau3', modelo: 'itau' },
    { file: 'mpago1', modelo: 'mpago' },
    { file: 'stone1', modelo: 'stone' },
]

// beforeAll(async() => {
//     for await (const item of bindings) {
//         const text = await getTextFromS3(`modelos/${item.file}.pdf`)

//         await fs.promises.writeFile(`temp/${item.file}.txt`, text)
//     }
// })

test.each(processors)('Verificar os extratos: %s', async (processorId) => {
    const currentFiles = bindings.filter(f => f.modelo == processorId)
    const outhersFiles = bindings.filter(f => f.modelo != processorId)

    const factory = ProcessorFactory.make(processorId)

    for await (const fileOuther of outhersFiles) {
        const text = await getTextFromS3(`modelos/${fileOuther.file}.pdf`)

        const validate = factory.validate(text)

        expect(validate, `${fileOuther.file} foi validado com ${processorId}`).toBeFalse()
    }

    for await (const currentFile of currentFiles) {
        const text = await getTextFromS3(`modelos/${currentFile.file}.pdf`)

        const validate = factory.validate(text)

        expect(validate, `${currentFile.file} foi não validado com ${processorId}`)
            .toBeTrue()
        
        const data = factory.handle(text)

        expect(data).toBeArray()
    }
})
