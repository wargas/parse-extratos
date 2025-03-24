import type { ProcessorInterface } from "./processor.interface";

export class MpagoProcessor implements ProcessorInterface {
    name: string = 'Mercado Pago';

    validate (text: string)  {
        return text.includes('www.mercadopago.com.br')
    };

    handle(text: string) {
        throw new Error("Method not implemented.");
    }

}