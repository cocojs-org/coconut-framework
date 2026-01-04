import * as fs from 'fs';

let number = 0;
const RE_DEFAULT_EXPORT = /export\s+default\s+(\w+);?\s?/;

export type ScanResult = { className: string; filePath: string }[];

/**
 * console.log(numberToLetter(0));  // A
 * console.log(numberToLetter(1));  // B
 * console.log(numberToLetter(25)); // Z
 * console.log(numberToLetter(26)); // AA
 * console.log(numberToLetter(27)); // AB
 * console.log(numberToLetter(51)); // AZ
 * console.log(numberToLetter(52)); // BA
 * @param n
 */
function numberToLetter(n: number) {
    let result = '';
    while (n >= 0) {
        result = String.fromCharCode((n % 26) + 65) + result;
        n = Math.floor(n / 26) - 1;
        if (n < 0) break;
    }
    return result;
}

export function scanOneFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (RE_DEFAULT_EXPORT.test(content)) {
        // todo 需要校验export出来的class名称和注解的是否一致
        // const className = RE_DEFAULT_EXPORT.exec(content)[1];
        return { className: numberToLetter(number++), filePath };
    }
    return null;
}
