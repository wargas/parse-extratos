import { parseData, toFloat } from "../utils";
import type { ProcessorInterface } from "./processor.interface";

export class BBProcessor implements ProcessorInterface {

    name: string = 'Banco do Brasil'

    validators = [
        new RegExp('0800 729 0088'),
        new RegExp('Dia Histórico Valor'),
        new RegExp('autoatendimento\.bb\.com\.br'),
    ]
    
    validate(text: string) {
        return this.validators.some(reg => reg.test(text))
    }

    handle(text: string) {
        if (this.validators[0].test(text)) {
            return this.modeloA(text)
        }
        if (this.validators[1].test(text)) {
            return this.modeloB(text)
        }

        if (this.validators[2].test(text)) {
            return this.modeloC(text)
        }
    }

    modeloA(text: string) {
        const normalizedText = text.replace(/\n([-\d\.]+,\d{2})\n([CD]) ?\n([-\d\.],\d{2} [CD])?/g, " $1 $2 $3\n")
            .replace(/  /g, ' ')
            .replace(/\n+/g, '\n')

        //Conta corrente 16269-8 INSTITUTO ATLANTICO
        const conta = normalizedText.match(/Conta corrente (.*?) /m)?.[1]||'-'

        const lines = normalizedText.split('\n');

        const lancamentos: any[] = []

        lines.forEach((l, index) => {
            if (l.includes('S A L D O')) {
                return;
            }
            if (l.includes('Saldo Anterior')) {
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
                    conta,
                    data: parseData(data),
                    lancamento,
                    documento,
                    valor: toFloat(valor) * (tipo == "D" ? -1 : 1),
                })
            }
        })

        return lancamentos;
    }

    modeloB(text: string) {

        const normalizedText = text.replace(/ +\n/g, "\n").replace(/ +/, " ")

        //Agência: 1218-1 Conta: 65727-1
        const conta = normalizedText.match(/Agência: .*? Conta: (.*)/m)?.[1]||''

        const matches = normalizedText.match(/^([-\d\.]+,\d{2} \([+-]\)\n\d{2}\/\d{2}\/\d{4}\n.*)/gm)

        if (!matches) {
            throw new Error("NAO POSSUI REGISTROS")
        }

        const lancamentos = matches.map(match => {

            const partes = match.split('\n')

            const valor = partes[0].split(' ')[0]
            const sinal = partes[0].replace(/[^+-]/g, "")

            return {
                conta,
                data: parseData(partes[1]),
                lancamento: partes[2].trim(),
                valor: toFloat(valor) * (sinal == "-" ? -1 : 1)
            }
        })

        return lancamentos
    }

    modeloC(text: string) {
        const normalizedText = text
            .replace(/ +/g, ' ')
            .replace(/ +\n/g, '\n')
            .replace(/\n+/g, '\n')
            .replace(/\n(\d{2}\/\d{2}\/\d{4})\n/g, "\n$1 ")

        const conta = normalizedText.match(/^Conta corrente ([\d-]*?) /m)?.[1]||'-'

        const lines = normalizedText.split('\n');

        const lancamentos: any[] = []

        lines.forEach((l, index) => {
            if (l.includes('S A L D O')) {
                return;
            }
            if (l.includes('Saldo Anterior')) {
                return;
            }

            const isLancamento = /^\d{2}\/\d{2}\/\d{4} .*?[-\d\.]+,\d{2} [CD]/.test(l.trim())
            const nextLine = lines[index + 1] ?? ''
            const hasNextLine = !/^\d{2}\/\d{2}\/\d{4} .*?[-\d\.]+,\d{2} [CD]/.test(nextLine.trim()) && !nextLine.startsWith('---')

            if (isLancamento) {

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
                    conta,
                    data: parseData(data),
                    lancamento,
                    valor: toFloat(valor) * (tipo == "D" ? -1 : 1),
                })
            }
        })

        return lancamentos
    }
}

