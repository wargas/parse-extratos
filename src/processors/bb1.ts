import { getText, parseData, toFloat } from "../utils";

export async function bb1(text: string) {
    const normalizedText = text.replace(/\n([-\d\.]+,\d{2})\n([CD]) ?\n([-\d\.],\d{2} [CD])?/g, " $1 $2 $3\n")
        .replace(/  /g, ' ')
        .replace(/\n+/g, '\n')

    const lines = normalizedText.split('\n');

    const lancamentos: any[] = []

    lines.forEach((l, index) => {
        if(l.includes('S A L D O')) {
            return;
        }
        if(l.includes('Saldo Anterior')) {
            return;
        }
        const startLancamento = /^\d{2}\/\d{2}\/\d{4} .*?[-\d\.]+,\d{2} [CD]/.test(l.trim())
        const nextLine = lines[index + 1] ?? ''
        const hasNextLine = !/^\d{2}\/\d{2}\/\d{4} .*?[-\d\.]+,\d{2} [CD]/.test(nextLine.trim()) && !nextLine.startsWith('---')

        if (startLancamento) {

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

    return lancamentos;
}