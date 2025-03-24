import { BBProcessor } from "./bb";
import { BradescoProcessor } from "./bradesco";
import { ItauProcessor } from "./itau";
import { MpagoProcessor } from "./mpago";
import type { ProcessorInterface } from "./processor.interface";
import { StoneProcessor } from "./stone";

const list: Record<string, ProcessorInterface> = {
    'bb': new BBProcessor(),
    'bradesco': new BradescoProcessor(),
    'itau': new ItauProcessor(),
    'stone': new StoneProcessor(),
    'mpago': new MpagoProcessor()
}


export class ProcessorFactory {
    static make(modelo: keyof typeof list): ProcessorInterface {
        if(!(modelo in list)) {
            throw new Error("Modelo nao registrado")
        }
        return list[modelo]
    }

    static list() {
        return Object.entries(list).map(([key, value]) => {
            return {
                id: key,
                name: value.name
            }
        })
    }
}

