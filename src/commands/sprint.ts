import { AmethystCommand, log4js } from 'amethystjs';
import { ApplicationCommandOptionType } from 'discord.js';
import { CalcType, DotLength, NumberLength, NumbersType } from '../typings/calculType';

export default new AmethystCommand({
    name: 'sprint',
    description: 'Lance un sprint de calculs',
    options: [
        {
            name: 'temps',
            description: 'Temps du sprint',
            type: ApplicationCommandOptionType.Integer,
            required: false,
            choices: [
                {
                    name: '1 minute',
                    value: 60000
                },
                {
                    name: '3 minutes',
                    value: 180000
                },
                {
                    name: '5 minutes',
                    value: 300000
                }
            ]
        },
        {
            name: 'nombres',
            description: 'Type de nombres',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: 'Décimaux',
                    value: NumbersType.Digit
                },
                {
                    name: 'Entiers',
                    value: NumbersType.Integer
                }
            ]
        },
        {
            name: 'virgules',
            description: 'Nombres derrière les virgules',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: '0 et 1',
                    value: DotLength.ZeroOne
                },
                {
                    name: '0 et 2',
                    value: DotLength.ZeroTwo
                },
                {
                    name: '1 et 1',
                    value: DotLength.OneOne
                },
                {
                    name: '2 et 1',
                    value: DotLength.TwoOne
                },
                {
                    name: '2 et 2',
                    value: DotLength.TwoTwo
                }
            ]
        },
        {
            name: 'longueur',
            description: 'Longueur des nombres',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: '2 et 2',
                    value: NumberLength.TwoTwo
                },
                {
                    name: '2 et 3',
                    value: NumberLength.ThreeTwo
                },
                {
                    name: '2 et 4',
                    value: NumberLength.TwoFour
                },
                {
                    name: '3 et 4',
                    value: NumberLength.ThreeFour
                },
                {
                    name: '4 et 4',
                    value: NumberLength.FourFour
                }
            ]
        },
        {
            name: 'calcul',
            description: 'Type de calcul',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: 'Addition',
                    value: CalcType.Addition
                },
                {
                    name: 'Soustraction',
                    value: CalcType.Soustraction
                },
                {
                    name: 'Multiplication',
                    value: CalcType.Multiplication
                },
                {
                    name: 'Division',
                    value: CalcType.Division
                }
            ]
        },
        {
            name: 'zéro',
            description: 'Inclut le zéro dans les calculs',
            required: false,
            type: ApplicationCommandOptionType.Boolean
        }
    ]
}).setChatInputRun(async ({ interaction, options }) => {
    if (interaction.client.sprints.alreadyStarted(interaction.user.id))
        return interaction
            .reply({
                ephemeral: true,
                content: 'Vous avez déjà commencé un sprint'
            })
            .catch(log4js.trace);

    const numbersType = (options.getString('nombres') as NumbersType) ?? NumbersType.Digit;
    const dotLength = (options.getString('virgules') as DotLength) ?? DotLength.TwoOne;
    const numbersLength = (options.getString('longueur') as NumberLength) ?? NumberLength.ThreeTwo;
    const operation = (options.getString('calcul') as CalcType) ?? CalcType.Multiplication;
    const zero = !!options.getBoolean('zéro');
    const time = options.getInteger('temps') ?? 180000;

    interaction.client.sprints.start({
        user: interaction.user,
        interaction,
        dotLength,
        numbersLength,
        hasZero: zero,
        time,
        numbersType,
        type: operation
    });
});
