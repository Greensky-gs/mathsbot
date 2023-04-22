import { CalcType, DotLength, NumberLength, NumbersType } from "../typings/calculType";

export const generateNumbers = ({ numberLength, dotLength, numberType, hasZero }: { numberLength: NumberLength; dotLength: DotLength; numberType: NumbersType, hasZero: boolean }): [number, number] => {
    const randomInt = () => Math.floor(Math.random() * (hasZero ? 10 : 9)) + (hasZero ? 0 : 1)
    const numbers: number[] = [];

    const list = [{ x: NumberLength.FourFour, y: [4, 4] }, { x: NumberLength.ThreeFour, y: [3, 4] }, { x: NumberLength.ThreeThree, y: [3, 3] }, { x: NumberLength.ThreeTwo, y: [3, 2] }, { x: NumberLength.TwoFour, y: [2, 4] }, { x: NumberLength.TwoTwo, y: [2, 2] }];
    for (let i = 0; i < 2; i++) {
        const values = list.find(x => x.x === numberLength).y;
        const length = values[i];

        let num = '';
        for (let k = 0; k < length; k++) {
            num += randomInt();
        };
        numbers.push(parseInt(num));
    }

    if (numberType === NumbersType.Digit) {
        const digits = [{ x: DotLength.OneOne, y: [1, 1] }, { x: DotLength.TwoOne, y: [2, 1] }, { x: DotLength.TwoTwo, y: [2, 2] }, { x: DotLength.ZeroOne, y: [0, 1] }, { x: DotLength.ZeroTwo, y: [0, 2] }]
        const digitValues = digits.find(x => x.x === dotLength).y;

        numbers.forEach((number, i) => {
            const info = digitValues[i];
            if (info === 0) return;

            numbers[i] = number / 10**info
        })
    }

    return numbers as [number, number];
}
export const generateCalcul = ({ numbers, operation }: { operation: CalcType; numbers: [number, number] }) => {
    const method = (Math.floor(Math.random() * 100) % 2) === 0 ? 'pop' : 'shift';
    const a = numbers[method]();
    const b = numbers.shift();

    const list = [{ x: CalcType.Addition, y: '+' }, { x: CalcType.Division, y: '/' }, { x: CalcType.Multiplication, y: '*' }, { x: CalcType.Soustraction, y: '-' }];
    const calcul = `${a} ${list.find(x => x.x === operation).y} ${b}`;

    return {
        calcul,
        result: eval(calcul)
    };
}