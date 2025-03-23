import { logger } from "../logger";
import { toFloat } from "../utils";

import type { ProcessorInterface } from "./processor.interface";

export class Itau1Processor implements ProcessorInterface {

    name: string = 'Itau 01'
    
    handle(text: string) {

        if (!text.includes('www.itau.com.br')) {
            logger.error(text)
            throw new Error('ARQUIVO NAO PERTENCE AO MODELO')
        }

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
}