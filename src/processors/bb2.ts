import { writeFile } from "fs/promises"
import { parseData, toFloat } from "../utils"

export async function bb2(text: string) {

    const normalizedText = text.replace(/ +\n/g, "\n").replace(/ +/, " ")

    const matches = normalizedText.match(/^([-\d\.]+,\d{2} \([+-]\)\n\d{2}\/\d{2}\/\d{4}\n.*)/gm)

    if(!matches) {
        throw new Error("NAO POSSUI REGISTROS")
    }

    const lancamentos = matches.map(match => {

        const partes = match.split('\n')

        const valor = partes[0].split(' ')[0]
        const sinal = partes[0].replace(/[^+-]/g, "")

        return {
            data: parseData(partes[1]),
            lancamento: partes[2].trim(),
            valor: toFloat(valor) * (sinal == "-" ? -1 : 1)
        }
    })

    await writeFile('temp/bb2.json', JSON.stringify(lancamentos, null, 4))
    return lancamentos
}