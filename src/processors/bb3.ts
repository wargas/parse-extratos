import { writeFile } from "fs/promises";
import { parseData, toFloat } from "../utils";

export async function bb3(text: string) {
    const normalizedText = text
        .replace(/ +/g, ' ')
        .replace(/ +\n/g, '\n')
        .replace(/\n+/g, '\n')
        .replace(/\n(\d{2}\/\d{2}\/\d{4})\n/g, "\n$1 ")

    const lines = normalizedText.split('\n');

    const lancamentos: any[] = []

    lines.forEach((l, index) => {
        if(l.includes('S A L D O')) {
            return;
        }
        if(l.includes('Saldo Anterior')) {
            return;
        }

        const isLancamento = /^\d{2}\/\d{2}\/\d{4} .*?[-\d\.]+,\d{2} [CD]/.test(l.trim())
        const nextLine = lines[index + 1] ?? ''
        const hasNextLine = !/^\d{2}\/\d{2}\/\d{4} .*?[-\d\.]+,\d{2} [CD]/.test(nextLine.trim()) && !nextLine.startsWith('---')

        if(isLancamento) {

            const parts = l.split(' ');

            const [data, agencia, lote, ...rest] = parts

            let parteFinal = rest.join(' ')

            if (/ [-\d\.]+,\d{2} [CD] [-\d\.]+,\d{2} [CD]$/.test(parteFinal) == false) {
                parteFinal = `${parteFinal} 0,00 D`
            }

            const [_, ___, tipo, valor, documento, ...lancamentoParts] = parteFinal.split(' ').reverse()

            lancamentoParts.reverse()

            if (hasNextLine) {
                lancamentoParts.push(nextLine)
            }

            const lancamento = lancamentoParts.join(' ')


            lancamentos.push({
                data: parseData(data),
                valor: toFloat(valor) * (tipo == "D" ? -1 : 1),
                lancamento,
            })
        }
    })

    return lancamentos
}