import { toFloat } from "../utils";

import type { ProcessorInterface } from "./processor.interface";

export class ItauProcessor implements ProcessorInterface {

    name: string = 'Itau'

    validate(text: string) {
        return text.includes('www.itau.com.br') || text.includes('ItaúEmpresas');
    }

    handle(text: string) {
        if (text.includes('www.itau.com.br/empresas')) {
            return this._handleA(text)
        }
        if (text.includes('(www.itau.com.br)')) {
            return this._handleB(text)
        }

        if (text.includes('ItaúEmpresas')) {
            return this._handleC(text)
        }
    }

    _handleA(text: string) {
        const periodos = text.match(/(período: [\s\S\r]*?\n)SALDO FINAL/gm)

        if (!periodos) {
            throw new Error("NAO POSSUI REGISTROS")
        }

        const lancamentos: any[] = []

        periodos?.forEach(periodo => {
            const mes = periodo.substring(12, 14)
            const ano = periodo.substring(15, 19)

            const lines = periodo.split("\n").filter(l => /\d{2} \/ \w{3}$/.test(l))

            const lancamentosPeriodo = lines.map(l => {
                const regex = /^(.*?) (\d+) ([-\d\.]+,\d{2})(\d{2}) \/ \w{3}$/
                const matches = l.match(regex)

                if (!matches) {
                    return null
                }

                const dia = matches[4]

                return {
                    data: `${ano}-${mes}-${dia}`,
                    lancamento: matches[1].trim(),
                    valor: toFloat(matches[3]),
                    codigo: matches[2]
                }
            }).filter(l => !!l)

            lancamentos.push(...lancamentosPeriodo)
        })

        return lancamentos;
    }

    _handleB(text: string) {

        const normalized = text.split('\n')
            .map(l => l.trim())
            .join('\n')

        const ano = normalized
            .match(/Extrato - Por Período\n\d{2}\/\d{2}\/(\d{4})/)?.[1]

        const lines = normalized.match(/^(\d{2}\/\d{2} .*[-\d\.]+,\d{2})$/gm)
            ?.map(l => {
                const [valor, codigo, ...rest] = l.split(' ').reverse()

                const [data, ...lancamento] = rest.reverse()

                return {
                    data: `${ano}-${data.split('/').reverse().join('-')}`,
                    lancamento: lancamento.join(' '),
                    valor: toFloat(valor),
                    codigo
                }
            }).filter(l => l.codigo != 'ANTERIOR') || []

        return lines;
    }

    _handleC(text: string) {
        const normalized = text.split('\n')
            .map(l => l.trim())
            .join('\n')

        const ano = normalized
            .match(/Extrato de \d{2}\/\d{2}\/(\d{4})/)?.[1]

        
        const lines = normalized.match(/^(\d{2}\/\d{2} .*[-\d\.]+,\d{2})$/gm)
            ?.map(l => {
                const [valor, codigo, ...rest] = l.split(' ').reverse()

                const [data, ...lancamento] = rest.reverse()

                return {
                    data: `${ano}-${data.split('/').reverse().join('-')}`,
                    lancamento: lancamento.join(' '),
                    valor: toFloat(valor),
                    codigo
                }
            }).filter(l => l.codigo != 'ANTERIOR') || []

        return lines;
    }
}