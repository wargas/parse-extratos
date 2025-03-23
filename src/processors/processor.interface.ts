export type ProcessorInterface = {
    name: string
    handle(text: string): any
}

