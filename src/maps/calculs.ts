import { CalcType, DotLength, NumberLength, NumbersType } from '../typings/calculType';

export default new Map<
    string,
    {
        userId: string;
        calculation: string;
        start: number;
        details: { numberType: NumbersType; dotLength: DotLength; type: CalcType; numbersLength: NumberLength };
    }
>();
