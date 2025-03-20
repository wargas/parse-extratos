import { toFloat } from "../utils"

export default async function stoneProcessor(text: string) {

    if (!text.includes('meajuda@stone.com.br')) {
        throw new Error('ARQUIVO NAO PERTENCE AO BANCO MODELO')
    }

    const regex = /(\d{2}\/\d{2}\/\d{4} [\s\S\r]*?[-\d\.]+,\d{2} [-\d\.]+,\d{2})/gm

    const matches = text.match(regex)

    if (!matches) {
        throw new Error("NAO POSSUI REGISTROS")
    }

    const periodos = text.split('período: ')
    

    const lancamentos = matches.map(match => {
        return match.replace(/\n/gm, " ")
    }).map(lines => {
        const regex = /(\d{2}\/\d{2}\/\d{4}) ([\s\S\r]*?)([-\d\.]+,\d{2}) ([-\d\.]+,\d{2})/

        const matches = lines.match(regex);

        if (!matches) {
            return null;
        }

        return {
            data: matches[1],
            lancamento: matches[2].trim(),
            valor: toFloat(matches[3]),
            saldo: toFloat(matches[4]),
        }
    })

    return lancamentos
}