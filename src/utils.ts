export function toFloat(str: string) {
    return parseFloat(str.replaceAll('.', '').replaceAll(',', '.'));
}