import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    EmbedField,
    InteractionReplyOptions,
    Message,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    User
} from 'discord.js';
import { calcul, calculDetails } from '../typings/calculType';
import { calculatePoints, generateCalcul, generateNumbers, secondsToWeeks } from './toolbox';
import { log4js, waitForInteraction } from 'amethystjs';
import { BattleTimes, timeType, times } from '../typings/battle';
import database from '../maps/database';

export class Battle {
    private users: [User, User];
    private interaction: CommandInteraction;
    private details: calculDetails;
    private _winner: User | null = null;
    private currentCalcul: calcul;
    private time: timeType;
    private turn: number = 0;
    private clocks: [number, number];
    private _ended: boolean = false;
    private startedOn: number = Date.now();
    private points: [number, number] = [0, 0];
    private pointsWinned: number;
    private timeout: NodeJS.Timeout;

    public get ended() {
        return this._ended;
    }
    public get winner() {
        return this._winner;
    }

    constructor({
        users,
        interaction,
        details,
        time
    }: {
        users: [User, User];
        interaction: CommandInteraction;
        details: calculDetails;
        time: timeType;
    }) {
        this.time = time;
        this.details = details;
        this.users = users;
        this.interaction = interaction;
        this.clocks = [this.time.time * 60000, this.time.time * 60000];

        this.start();
    }

    private edit(content: InteractionReplyOptions & { fetchReply?: boolean }) {
        const method = this.interaction.deferred || this.interaction.replied ? 'editReply' : 'reply';
        return this.interaction[method](content);
    }
    private generateCalcul() {
        const numbers = generateNumbers({
            dotLength: this.details.dotLength,
            hasZero: this.details.hasZero,
            numberLength: this.details.numbersLength,
            numberType: this.details.numbersType
        });
        const calcul = generateCalcul({ numbers, operation: this.details.type });
        this.currentCalcul = calcul;

        return calcul;
    }
    private get userToPlay() {
        return this.users[this.turn % 2];
    }
    private get clocksField(): [EmbedField, EmbedField] {
        if (this._ended) {
            return [
                {
                    name: this.users[0].username ?? 'Premier joueur',
                    value: secondsToWeeks(this.clocks[0] / 1000),
                    inline: true
                },
                {
                    name: this.users[1].username ?? 'Deuxième joueur',
                    value: secondsToWeeks(this.clocks[1] / 1000),
                    inline: true
                }
            ];
        }
        return [
            {
                name: this.users[0].username ?? 'Premier joueur',
                value:
                    this.turn % 2 === 0
                        ? `<t:${((Date.now() + this.clocks[0]) / 1000).toFixed(0)}:R>`
                        : secondsToWeeks(this.clocks[0] / 1000),
                inline: true
            },
            {
                name: this.users[1].username ?? 'Deuxième joueur',
                value:
                    this.turn % 2 === 1
                        ? `<t:${((Date.now() + this.clocks[1]) / 1000).toFixed(0)}:R>`
                        : secondsToWeeks(this.clocks[1] / 1000),
                inline: true
            }
        ];
    }
    private get button() {
        return [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
                new ButtonBuilder().setCustomId('battle-solve').setLabel('Résoudre').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('resign').setLabel('Abandonner').setStyle(ButtonStyle.Danger)
            )
        ];
    }
    private get modal() {
        return new ModalBuilder()
            .setTitle('Résolution')
            .setCustomId('solving')
            .setComponents(
                new ActionRowBuilder<TextInputBuilder>().setComponents(
                    new TextInputBuilder()
                        .setLabel('Réponse')
                        .setPlaceholder('Entrez votre réponse')
                        .setCustomId('answer')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                )
            );
    }
    private embed() {
        const embed = new EmbedBuilder()
            .setTitle('Bataille de calculs')
            .setDescription(
                `C'est à <@${this.userToPlay.id}> de jouer\n\nRésolvez ce calcul \`\`\`${this.currentCalcul.calcul}\`\`\``
            )
            .setColor('Orange')
            .setFields(this.clocksField)
            .setTimestamp()
            .setFooter({
                text: 'Bataille de problèmes',
                iconURL: this.userToPlay.displayAvatarURL({ forceStatic: false })
            });
        return embed;
    }
    private get resignButtons() {
        return [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
                new ButtonBuilder().setLabel('Oui').setCustomId('yes').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setLabel('Non').setCustomId('no').setStyle(ButtonStyle.Danger)
            )
        ];
    }
    private switchPlayer() {
        this.turn++;
        return this;
    }
    private onSolve() {
        this.interaction.client.on('buttonInteraction', async (button) => {
            if (!['battle-solve', 'resign'].includes(button.customId)) return;

            if (!this.users.map((x) => x.id).includes(button.user.id)) {
                button
                    .reply({
                        content: 'Vous ne participez pas à cette bataille',
                        ephemeral: true
                    })
                    .catch(log4js.trace);
                return;
            }
            if (button.customId === 'resign') {
                const confirmationMsg = (await button
                    .reply({
                        ephemeral: true,
                        content: 'Êtes vous sûr de vouloir abandonner ?',
                        components: this.resignButtons,
                        fetchReply: true
                    })
                    .catch(log4js.trace)) as Message<true>;
                if (!confirmationMsg) return;

                const confirmation = await waitForInteraction({
                    componentType: ComponentType.Button,
                    message: confirmationMsg,
                    user: button.user
                }).catch(log4js.trace);
                if (confirmation) confirmation.deferUpdate().catch(log4js.trace);
                if (!confirmation || confirmation.customId === 'no') {
                    button.deleteReply(confirmationMsg).catch(log4js.trace);
                    return;
                }

                button.deleteReply(confirmationMsg).catch(log4js.trace);

                const diff = this.differenceWithStart;
                this.clocks[this.turn % 2] -= diff;
                this.clocks[this.turn % 2] += this.time.increment * 60000;

                this.end(
                    'resign',
                    this.users.find((x) => x.id !== button.user.id)
                );
                return;
            }
            if (this.userToPlay.id !== button.user.id) {
                button
                    .reply({
                        content: "Ce n'est pas votre tour",
                        ephemeral: true
                    })
                    .catch(log4js.trace);
                return;
            }

            await button.showModal(this.modal);
            const reply = await button
                .awaitModalSubmit({
                    time: 10000
                })
                .catch(log4js.trace);
            if (!reply) return;
            reply.deferUpdate().catch(log4js.trace);
            if (this._ended) {
                return;
            }

            const answer = parseFloat(reply.fields.getTextInputValue('answer').replace(/ +/g, '').replace(/,/g, '.'));
            if (!answer) return;

            const diff = this.differenceWithStart;
            this.clocks[this.turn % 2] -= diff;
            this.clocks[this.turn % 2] += this.time.increment * 60000;

            this.switchPlayer();
            if (answer !== this.currentCalcul.result) {
                this.end('wrong answer', this.userToPlay);
            } else {
                const old = this.currentCalcul;
                this.generateCalcul();

                this.updateStart();

                this.edit({
                    content: `\`✅ ${old.calcul} = ${answer}\``,
                    embeds: [this.embed()]
                });

                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.end("time's up", this.users[(this.turn + 1) % 2]);
                }, this.clocks[this.turn % 2]);

                this.points[(this.turn - 1) % 2] += calculatePoints({
                    details: {
                        dotLength: this.details.dotLength,
                        numbersLength: this.details.numbersLength,
                        numberType: this.details.numbersType,
                        type: this.details.type
                    },
                    answer: answer,
                    solution: old.result,
                    time: diff,
                    right: true
                });
            }
        });
    }
    private addPoints() {
        const points = Math.floor(
            (this.points[this.users.indexOf(this.users.find((x) => x.id === this._winner.id))] * 80) / 100
        );
        database.addPoints(this._winner.id, points);

        this.pointsWinned = points;
        return points;
    }
    private get errorEmbed() {
        return new EmbedBuilder()
            .setTitle('Erreur')
            .setDescription(
                `<@${this.users.find((x) => x.id !== this._winner.id).id}> s'est trompé\n\`\`\`${
                    this.currentCalcul.calcul
                } = ${this.currentCalcul.result}\`\`\`\n\n<@${this._winner.id}> est le gagnant`
            )
            .setColor('#00ff00')
            .setTimestamp()
            .setFields([
                ...this.clocksField,
                { name: 'Points', value: `${this.pointsWinned.toLocaleString()} points` }
            ]);
    }
    private get resignEmbed() {
        return new EmbedBuilder()
            .setTitle('Abandon')
            .setDescription(
                `<@${this.users.find((x) => x.id !== this._winner.id).id}> a abandonné\n\nLe gagnant est <@${
                    this._winner.id
                }>`
            )
            .setColor('#00ff00')
            .setTimestamp()
            .setFields([
                ...this.clocksField,
                { name: 'Points', value: `${this.pointsWinned.toLocaleString()} points` }
            ]);
    }
    private get timeEmbed() {
        return new EmbedBuilder()
            .setTitle('Temps écoulé')
            .setDescription(
                `<@${this.users.find((x) => x.id !== this._winner.id).id}> a perdu au temps\n\nLe gagnant est <@${
                    this._winner.id
                }>`
            )
            .setColor('#00ff00')
            .setTimestamp()
            .setFields([
                ...this.clocksField,
                { name: 'Points', value: `${this.pointsWinned.toLocaleString()} points` }
            ]);
    }
    private end(reason: "time's up" | 'wrong answer' | 'resign', winner: User) {
        clearTimeout(this.timeout);
        this._ended = true;
        this._winner = winner;
        this.addPoints();

        if (reason === 'wrong answer') {
            this.edit({
                components: [],
                embeds: [this.errorEmbed]
            }).catch(log4js.trace);
        } else if (reason === 'resign') {
            this.edit({
                components: [],
                embeds: [this.resignEmbed]
            }).catch(log4js.trace);
        } else {
            this.edit({
                embeds: [this.timeEmbed],
                components: []
            }).catch(log4js.trace);
        }
    }
    private get differenceWithStart() {
        return Date.now() - this.startedOn;
    }
    private updateStart() {
        this.startedOn = Date.now();
        return this;
    }
    private start() {
        this.generateCalcul();
        this.onSolve();

        this.timeout = setTimeout(() => {
            this.end("time's up", this.users[1]);
        }, this.clocks[0]);

        this.edit({
            embeds: [this.embed()],
            components: this.button
        }).catch(log4js.trace);

        this.updateStart();
    }
}
