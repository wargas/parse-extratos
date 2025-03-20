import { toFloat } from "../utils"

const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export default async function itauProcessor(text: string) {

    if (!text.includes('www.itau.com.br')) {
        throw new Error('ARQUIVO NAO PERTENCE AO BANCO MODELO')
    }


    const periodos = text.match(/(período: [\s\S\r]*?\n)SALDO FINAL/gm)

    if (!periodos) {
        throw new Error("NAO POSSUI REGISTROS")
    }

    const lancamentos:any[] = []

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