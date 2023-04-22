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
export const secondsToWeeks = (time: number) => {
    let seconds = 0;
    let minutes = 0;
    let hours = 0;
    let days = 0;
    let weeks = 0;
    let years = 0;

    for (let i = 0; i < time; i++) {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }
        if (minutes === 60) {
            hours++;
            minutes = 0;
        }
        if (hours === 24) {
            hours = 0;
            days++;
        }
        if (days === 7) {
            weeks++;
            days = 0;
        }
        if (weeks === 52) {
            years++;
            weeks = 0;
        }
    }

    const superior = [
        { name: 'seconde', value: seconds },
        { name: 'minute', value: minutes },
        { name: 'heure', value: hours },
        { name: 'jour', value: days },
        { name: 'semaine', value: weeks },
        { name: 'année', value: years }
    ]
        .filter((x) => x.value > 0)
        .reverse();

    const format = [];
    superior.forEach((sup) => {
        format.push(`${sup.value.toLocaleString()} ${sup.name}${sup.value === 1 ? '' : 's'}`);
    });
    let str = '';

    format.forEach((v, i, a) => {
        str += v + (a[i + 1] ? (a[i + 2] ? ', ' : ' et ') : '');
    });
    return str;
};