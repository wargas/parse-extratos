import { expect, test,  } from 'bun:test'
import { clientS3 } from '../src/s3'

test('Posso conectar ao s3?', async () => {    
    await clientS3.write('teste.txt', 'teste')
    const file = clientS3.file('teste.txt');
    const texto = await file.text()

    expect(texto).toBe('teste')

    await clientS3.delete('teste.txt')
}) 


