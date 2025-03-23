import { write } from "bun";
import { parseData, toFloat } from "../utils";

export async function bradesco(text: string) {

    const data = { value: '' }

    const normalizedText = text
        .replace(/Folha \d+\/\d+[\s\S\r]*?\d{2}\/\d{2}\/\d{4} - \d{2}h\d{2}/g, "").trim()
        .replace(/Extrato de:[\s\S\r]*?SALDO ANTERIOR[\s\S\r]*?[-\d\.]+,\d{2}/g, "").trim()
        .replace(/ (\d+ [\d\.-]+,\d{2} [\d\.-]+,\d{2})/g, "\n$1")
        .split("\n")
        .filter(l => !l.startsWith("Total "))
        .map(l => l.trim())
        .map(l => {
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(l)) {
                data.value = l;
                return "";
            }
            if (/^\d+ [\d\.-]+,\d{2} [\d\.-]+,\d{2}$/.test(l)) {
                return `${data.value} ${l}\n`
            }

            return l + " "
        })
        .join("").split("\n")
        .map(l => l.trim())
        .filter(l => /\d+ [\d\.-]+,\d{2} [\d\.-]+,\d{2}$/.test(l))
        .join("\n")

    const lancamentos = normalizedText.split("\n").map((l) => {
        const parts = l.split(' ');
        const [saldo, valor, codigo, data, ...rest] = parts.reverse()

        const lancamento = rest.reverse().join(" ")

        return {
            lancamento,
            codigo,
            data: parseData(data),
            valor: toFloat(valor),
            saldo: toFloat(saldo)
        }
    })

    await write('temp/bradesco.json', JSON.stringify(lancamentos, null, 4))

    return lancamentos
}