export type ProcessorInterface = {
    validate: (text: string) => boolean
    name: string
    handle(text: string): any
}

