import { CalcType, DotLength, NumberLength, NumbersType, calcul, calculDetails } from '../typings/calculType';

export const generateNumbers = ({
    numberLength,
    dotLength,
    numberType,
    hasZero
}: {
    numberLength: NumberLength;
    dotLength: DotLength;
    numberType: NumbersType;
    hasZero: boolean;
}): [number, number] => {
    const randomInt = () => Math.floor(Math.random() * (hasZero ? 10 : 9)) + (hasZero ? 0 : 1);
    const numbers: number[] = [];

    const list = [
        { x: NumberLength.FourFour, y: [4, 4] },
        { x: NumberLength.ThreeFour, y: [3, 4] },
        { x: NumberLength.ThreeThree, y: [3, 3] },
        { x: NumberLength.ThreeTwo, y: [3, 2] },
        { x: NumberLength.TwoFour, y: [2, 4] },
        { x: NumberLength.TwoTwo, y: [2, 2] }
    ];
    for (let i = 0; i < 2; i++) {
        const values = list.find((x) => x.x === numberLength).y;
        const length = values[i];

        let num = '';
        for (let k = 0; k < length; k++) {
            num += randomInt();
        }
        numbers.push(parseInt(num));
    }

    if (numberType === NumbersType.Digit) {
        const digits = [
            { x: DotLength.OneOne, y: [1, 1] },
            { x: DotLength.TwoOne, y: [2, 1] },
            { x: DotLength.TwoTwo, y: [2, 2] },
            { x: DotLength.ZeroOne, y: [0, 1] },
            { x: DotLength.ZeroTwo, y: [0, 2] }
        ];
        const digitValues = digits.find((x) => x.x === dotLength).y;

        numbers.forEach((number, i) => {
            const info = digitValues[i];
            if (info === 0) return;

            numbers[i] = number / 10 ** info;
        });
    }

    return numbers as [number, number];
};
const calculateFloatMultiplication = (a: number, b: number, operator: string) => {
    const apower = a.toString().split('.')[1].length;
    const bpower = a.toString().split('.')[1].length;

    const calcul = `${a*(10**apower)} ${operator} ${b*(10**bpower)}`;
    const result = eval(calcul) as number;

    return result / 10**(apower + bpower);
}
const calculateFloatAddition = (a: number, b: number, operator: string) => {
    const adec = a.toString().split('.')[1];
    const bdec = b.toString().split('.')[1];

    const longest = adec.length > bdec.length ? adec.length : bdec.length;
    const result = eval(`(${a*(10**longest)}) ${operator} (${b*(10**longest)})`)

    return result / (10**longest)
}
export const generateCalcul = ({ numbers, operation }: { operation: CalcType; numbers: [number, number] }): calcul => {
    const method = Math.floor(Math.random() * 100) % 2 === 0 ? 'pop' : 'shift';
    const a = numbers[method]();
    const b = numbers.shift();

    const list = [
        { x: CalcType.Addition, y: '+' },
        { x: CalcType.Division, y: '/' },
        { x: CalcType.Multiplication, y: '*' },
        { x: CalcType.Soustraction, y: '-' }
    ];
    const calcul = `${a} ${list.find((x) => x.x === operation).y} ${b}`;

    let result = 0;
    if ([a, b].some(n => n.toString().includes('.'))) {
        if ([CalcType.Multiplication, CalcType.Division].includes(operation)) {
            result = calculateFloatMultiplication(a, b, list.find(x => x.x === operation).y);
        } else {
            result = calculateFloatAddition(a, b, list.find(x => x.x === operation).y);
        }
    } else {
        result = eval(calcul)
    }

    return {
        calcul,
        result: result
    };
};
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
export const calculatePoints = ({
    details,
    time,
    solution,
    answer,
    right
}: {
    details: { numberType: NumbersType; dotLength: DotLength; type: CalcType; numbersLength: NumberLength };
    time: number;
    solution: number;
    answer: number;
    right: boolean;
}) => {
    const values = {
        type: [
            { x: CalcType.Addition, y: 1 },
            { x: CalcType.Division, y: 4 },
            { x: CalcType.Multiplication, y: 3 },
            { x: CalcType.Soustraction, y: 2 }
        ],
        dot: [
            { x: DotLength.ZeroOne, y: 0 },
            { x: DotLength.ZeroTwo, y: 1 },
            { x: DotLength.TwoTwo, y: 3 },
            { x: DotLength.TwoOne, y: 2 },
            { x: DotLength.OneOne, y: 1 }
        ],
        length: [
            { x: NumberLength.FourFour, y: 6 },
            { x: NumberLength.ThreeFour, y: 5 },
            { x: NumberLength.ThreeThree, y: 4 },
            { x: NumberLength.ThreeTwo, y: 3 },
            { x: NumberLength.TwoFour, y: 4 },
            { x: NumberLength.TwoTwo, y: 1 }
        ],
        integer: [
            { x: NumbersType.Integer, y: 0.1 },
            { x: NumbersType.Digit, y: 2 }
        ]
    };

    let points = 0;
    const add = <T extends keyof typeof values, K extends (typeof values)[T][0]['x']>(key: T, value: K) => {
        const array = values[key] as { x: K; y: number }[];
        points += array.find((x) => x.x === value).y;
    };

    if (details.numberType === NumbersType.Digit) add('dot', details.dotLength);
    add('integer', details.numberType);
    add('length', details.numbersLength);
    add('type', details.type);

    if (time < 60000) {
        const values = [
            { x: CalcType.Addition, y: 0.5 },
            { x: CalcType.Division, y: 2 },
            { x: CalcType.Multiplication, y: 1 },
            { x: CalcType.Soustraction, y: 1 }
        ];
        points += values.find((x) => x.x === details.type).y;
    } else if (time < 120000) {
        const values = [
            { x: CalcType.Addition, y: 0.2 },
            { x: CalcType.Division, y: 1 },
            { x: CalcType.Multiplication, y: 0.5 },
            { x: CalcType.Soustraction, y: 0.5 }
        ];
        points += values.find((x) => x.x === details.type).y;
    } else {
        const values = [
            { x: CalcType.Addition, y: 0.1 },
            { x: CalcType.Division, y: 0.7 },
            { x: CalcType.Multiplication, y: 0.4 },
            { x: CalcType.Soustraction, y: 0.2 }
        ];
        points += values.find((x) => x.x === details.type).y;
    }

    if (right) {
        points += 5;
    } else {
        const five = Math.floor((solution * 5) / 100);

        if (solution - five < answer && answer < solution + five) {
            points += 0.2;
        }
    }

    points *= 10;

    return points;
};
