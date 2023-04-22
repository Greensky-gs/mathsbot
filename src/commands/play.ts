import { AmethystCommand, log4js } from "amethystjs";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from "discord.js";
import { CalcType, DotLength, NumberLength, NumbersType } from "../typings/calculType";
import { generateCalcul, generateNumbers } from "../utils/toolbox";
import calculs from "../maps/calculs";

export default new AmethystCommand({
    name: 'lancer',
    description: "Créer un calcul que vous devez résoudre",
    options: [
        {
            name: 'nombres',
            description: "Type de nombres",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: 'Décimal',
                    value: NumbersType.Digit
                },
                {
                    name: "Entiers",
                    value: NumbersType.Integer
                }
            ]
        },
        {
            name: "virgules",
            description: "Nombres derrière les virgules",
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
            description: "Longueur des nombres",
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
            description: "Type de calcul",
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
            description: "Inclut le zéro dans les calculs",
            required: false,
            type: ApplicationCommandOptionType.Boolean
        }
    ]
}).setChatInputRun(async({ interaction, options }) => {
    const numbersType = options.getString('nombres') as NumbersType ?? NumbersType.Digit;
    const dotLength = options.getString('virgules') as DotLength ?? DotLength.TwoOne;
    const numbersLength = options.getString('longueur') as NumberLength ?? NumberLength.ThreeTwo;
    const operation = options.getString('calcul') as CalcType ?? CalcType.Multiplication;
    const zero = !!options.getBoolean('zéro')

    const numbers = generateNumbers({ dotLength, numberLength: numbersLength, numberType: numbersType, hasZero: zero });

    const calcul = generateCalcul({ numbers, operation });
    const msg = await interaction.reply({
        embeds: [ new EmbedBuilder()
            .setTitle("Calcul")
            .setDescription(`Un nouveau calcul a spawn ! Appuyez sur le bouton pour le résoudre\n\`\`\`${calcul.calcul}\`\`\``)
            .setColor('Orange')
            .setTimestamp()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ forceStatic: false }) })
        ],
        components: [
            new ActionRowBuilder<ButtonBuilder>()
                .setComponents(new ButtonBuilder()
                    .setLabel('Résoudre')
                    .setCustomId('solve')
                    .setStyle(ButtonStyle.Secondary)
                )
        ],
        fetchReply: true
    }).catch(log4js.trace) as Message<true>;

    if (!msg) return log4js.trace(`Le message n'a pas pu être envoyé`)

    calculs.set(msg.id, {
        userId: interaction.user.id,
        calculation: calcul.calcul
    });
})