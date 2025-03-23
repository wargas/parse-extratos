import { BB1Processor } from "./bb1";
import { BB2Processor } from "./bb2";
import { BB3Processor } from "./bb3";
import { Bradesco1Processor } from "./bradesco";
import { Itau1Processor } from "./itau";
import type { ProcessorInterface } from "./processor.interface";
import { Stone1Processor } from "./stone";

const list: Record<string, ProcessorInterface> = {
    'bb1': new BB1Processor(),
    'bb2': new BB2Processor(),
    'bb3': new BB3Processor(),
    'bradesco1': new Bradesco1Processor(),
    'itau1': new Itau1Processor(),
    'stone1': new Stone1Processor()
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

