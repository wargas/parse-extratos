import { toFloat } from "../utils";
import type { ProcessorInterface } from "./processor.interface";

export class MpagoProcessor implements ProcessorInterface {
    name: string = 'Mercado Pago';

    validate (text: string)  {
        return text.includes('www.mercadopago.com.br')
    };

    handle(text: string) {
        const normalized = text.split('\n')
            .map(l => l.trim())
            .join('\n');

        const matches = normalized.match(/^(\d{2}-\d{2}-\d{4}[\s\S\r]*?[-\d\.],\d{2})$/gm)

        const lancamentos = matches?.map(l => {
            const [data, ...rest] = l.replace(/\n/g, ' ')
                .split(' ')

            const [saldo, _, valor, __, codigo, ...lancamento] = rest.reverse()

            return {
                lancamento: lancamento.reverse().join(' '),
                data: data.split('-').reverse().join('-'),
                codigo,
                valor: toFloat(valor),
                saldo: toFloat(valor),
            }
        })

        return lancamentos
    }

}