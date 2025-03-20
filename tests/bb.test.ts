import fs from 'fs/promises'
import { expect, test } from 'bun:test'
import { getText } from '../src/utils'
import { bb1 } from '../src/processors/bb1'
import { bb2 } from '../src/processors/bb2'
import { bb3 } from '../src/processors/bb3'

test('posso extrair bb1', async () => {
    const text = await getText('modelos/bb1.pdf')

    const extrato = await bb1(text)

    expect(extrato).toBeArray()
    
    expect(extrato[0].valor).toBe(2000)
})

test('posso extrair bb2', async () => {
    const text = await getText('modelos/bb2.pdf')

    await fs.writeFile('temp/bb2.txt', text)

    const extrato = await bb3(text)

    expect(extrato).toBeArray()

    expect(extrato[0].valor).toBe(105.88)
    
})

test('posso extrair bb3', async () => {
    const text = await getText('modelos/bb3.pdf')

    await fs.writeFile('temp/bb3.txt', text)

    const extrato = await bb3(text)

    expect(extrato).toBeArray()

    expect(extrato[0].valor).toBe(-0.47)
    
})