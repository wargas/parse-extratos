import { describe, expect, test } from 'bun:test'
import { bradesco } from '../src/processors/bradesco'
import { getTextFromS3 } from '../src/utils'

describe('testando extratos do bradesco', () => {
    test('parse bradesco', async () => {
        const text = await getTextFromS3('modelos/bradesco1.pdf')

        const extrato = await bradesco(text)

        expect(extrato).toBeArray()

        expect(extrato[0].valor).toBe(25516.41)

    })
})