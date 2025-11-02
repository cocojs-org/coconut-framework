// console.log(numberToLetter(0));  // A
// console.log(numberToLetter(1));  // B
// console.log(numberToLetter(25)); // Z
// console.log(numberToLetter(26)); // AA
// console.log(numberToLetter(27)); // AB
// console.log(numberToLetter(51)); // AZ
// console.log(numberToLetter(52)); // BA
export function numberToLetter(n: number) {
    let result = '';
    while (n >= 0) {
        result = String.fromCharCode((n % 26) + 65) + result;
        n = Math.floor(n / 26) - 1;
        if (n < 0) break;
    }
    return result;
}
