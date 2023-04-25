import { AmethystCommand, log4js, waitForInteraction } from "amethystjs";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Message } from "discord.js";
import { NumbersType, DotLength, NumberLength, CalcType } from "../typings/calculType";
import { BattleTimes, timeType, times } from "../typings/battle";
import { Battle } from "../utils/Battle";

export default new AmethystCommand({
    name: 'bataille',
    description: "Lance une bataille",
    options: [
        {
            name: "utilisateur",
            description: "Adversaire contre lequel vous voulez jouer",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'temps',
            description: "Temps que vous voulez donner",
            required: true,
            type: ApplicationCommandOptionType.String,
            autocomplete: true
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
}).setChatInputRun(async({ interaction, options }) => {
    const numbersType = (options.getString('nombres') as NumbersType) ?? NumbersType.Digit;
    const dotLength = (options.getString('virgules') as DotLength) ?? DotLength.TwoOne;
    const numbersLength = (options.getString('longueur') as NumberLength) ?? NumberLength.ThreeTwo;
    const operation = (options.getString('calcul') as CalcType) ?? CalcType.Multiplication;
    const zero = !!options.getBoolean('zéro');
    const time = times[options.getString('temps')] as timeType ?? times.Blitz;
    const user = options.getUser('utilisateur')

    if (user.bot) return interaction.reply({
        ephemeral: true,
        content: "Vous ne pouvez pas défier un bot"
    }).catch(log4js.trace);
    if (user.id === interaction.user.id) return interaction.reply({
        content: "Vous ne pouvez pas vous défier vous-même",
        ephemeral: true
    }).catch(log4js.trace);

    const dot = [{ x: DotLength.OneOne, y: 'un et un' }, { x: DotLength.TwoOne, y: 'deux et un' }, { x: DotLength.TwoTwo, y: "deux et deux" }, { x: DotLength.ZeroOne, y: 'zéro et un' }, { x: DotLength.ZeroTwo, y: 'zéro et deux' }];
    const length = [{ x: NumberLength.FourFour, y: 'quatre et quatre' }, { x: NumberLength.ThreeFour, y: 'trois et quatre' }, { x: NumberLength.ThreeThree, y: 'trois et trois' }, { x: NumberLength.ThreeTwo, y: 'trois et deux' }, { x: NumberLength.TwoFour, y: 'deux et quatre' }, { x: NumberLength.TwoTwo, y: 'deux et deux' }];
    const calcType = [{ x: CalcType.Addition, y: 'addition' }, { x: CalcType.Division, y: 'division' }, { x: CalcType.Multiplication, y: 'multiplication' }, { x: CalcType.Soustraction, y: 'soustraction' }];

    const ask = await interaction.reply({
        content: `<@${user.id}>`,
        embeds: [ new EmbedBuilder()
            .setTitle("Bataille de calculs")
            .setDescription(`<@${interaction.user.id}> vous défie dans une bataille de calculs. Relevez-vous le défi ?\n\n**Modalités :**\nTemps : ${time.name} ( ${time.time} minutes plus ${time.increment * 60} secondes )\nNombres : \`${numbersType === NumbersType.Digit ? "décimaux" : "entiers"}\`${numbersType === NumbersType.Integer ? '' : `\nNombres après la virgule : ${dot.find(x => x.x === dotLength).y}`}\nLongueur des nombres : ${length.find(x => x.x === numbersLength).y}\nCalculs : ${calcType.find(x => x.x === operation).y}\nZéro dans les calculs : ${zero ? '✅' : '❌'}`)
            .setColor('Grey')
            .setTimestamp()
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ forceStatic: false }) })
        ],
        components: [new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
                .setLabel('Oui')
                .setCustomId('yes')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setLabel('Non')
                .setCustomId('no')
                .setStyle(ButtonStyle.Danger)
        )],
        fetchReply: true
    }).catch(log4js.trace) as Message<true>;

    if (!ask) return log4js.trace("Message non-envoyé");

    const reply = await waitForInteraction({
        message: ask,
        componentType: ComponentType.Button,
        user,
        replies: {
            everyone: {
                content: "Vous n'êtes pas autorisé à interagir avec ce message",
                ephemeral: true
            }
        }
    }).catch(log4js.trace);

    if (!reply || reply.customId === 'no') {
        return interaction.editReply({
            embeds: [],
            content: "❌ Défi refusé",
            components: []
        }).catch(() => {});
    }
    await reply.deferUpdate().catch(log4js.trace)
    const battle = new Battle({
        users: [ user, interaction.user ],
        interaction,
        time: time,
        details: {
            dotLength,
            hasZero: zero,
            numbersLength,
            numbersType,
            type: operation
        }
    });
})