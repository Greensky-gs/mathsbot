import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    Collection,
    CommandInteraction,
    EmbedBuilder,
    If,
    InteractionReplyOptions,
    Message,
    ModalBuilder,
    ReplyOptions,
    TextInputBuilder,
    TextInputStyle,
    User,
    range
} from 'discord.js';
import { CalcType, DotLength, NumberLength, NumbersType, calculDetails } from '../typings/calculType';
import { calculatePoints, generateCalcul, generateNumbers, secondsToWeeks } from './toolbox';
import database from '../maps/database';
import { log4js } from 'amethystjs';

class Sprint {
    private _user: User;
    private _message: Message<true>;
    private _details: calculDetails;
    private time: number;
    private _tries: boolean[] = [];
    private endsAt: number;
    private calcul: { calcul: string; result: number };
    private points: number = 0;
    private lastStartCalculation: number;
    private _ended: boolean = false;
    private start: number = Date.now();
    private onEnd: (sprint: Sprint) => unknown = (sprint) => {};

    public get user() {
        return this._user;
    }
    public get tries() {
        return this._tries;
    }
    public get details() {
        return this._details;
    }
    public get ended() {
        return this._ended;
    }
    public get message() {
        return this._message;
    }

    /**
     * @description Time in milliseconds
     */
    constructor({
        interaction,
        user,
        details,
        time
    }: {
        interaction: CommandInteraction;
        user: User;
        time: number;
        details: calculDetails;
    }) {
        this._user = user;
        this._details = details;
        this.time = time;
        this.endsAt = Date.now() + time;
        this.lastStartCalculation = Date.now();

        this.sendMessage(interaction);
    }
    public listenEnd(callback: (sprint: Sprint) => unknown) {
        this.onEnd = callback;
    }

    private generateCalcul() {
        const numbers = generateNumbers({
            numberLength: this._details.numbersLength,
            numberType: this._details.numbersType,
            hasZero: this._details.hasZero,
            dotLength: this._details.dotLength
        });
        const calcul = generateCalcul({ numbers, operation: this._details.type });
        this.calcul = calcul;

        return calcul;
    }
    private generateContent<Fetch extends boolean>(
        calcul: { calcul: string; result: number },
        { fetchReply, result }: { fetchReply?: Fetch; result?: string }
    ): { embeds: EmbedBuilder[]; components: ActionRowBuilder<ButtonBuilder>[]; fetchReply: Fetch; content?: string } {
        const embed = new EmbedBuilder()
            .setTitle('Sprint de calcul')
            .setDescription(`${this._tries.length + 1}° calcul :\`\`\`${calcul.calcul}\`\`\``)
            .setColor('Orange')
            .setFields({
                name: 'Fin',
                value: `Fin <t:${(this.endsAt / 1000).toFixed(0)}:R>`,
                inline: false
            })
            .setTimestamp(new Date(this.endsAt))
            .setFooter({ text: this._user.username, iconURL: this._user.displayAvatarURL({ forceStatic: false }) });

        const components = new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder().setCustomId('sprint-solve').setLabel('Résoudre').setStyle(ButtonStyle.Success)
        );
        if (result) {
            return {
                embeds: [embed],
                components: [components],
                fetchReply: !!fetchReply as Fetch,
                content: `\`${result}\``
            };
        }
        return { embeds: [embed], components: [components], fetchReply: !!fetchReply as Fetch };
    }
    private async sendMessage(interaction: CommandInteraction) {
        const calcul = this.generateCalcul();
        const msg = (await interaction
            .reply(this.generateContent(calcul, { fetchReply: true }))
            .catch(log4js.trace)) as Message<true>;

        this._message = msg;
        return msg;
    }
    private edit(guess: number) {
        if (this.ended) return;

        const precedent = this.calcul;
        const right = guess === precedent.result;

        const time = Date.now() - this.lastStartCalculation;

        this.points += calculatePoints({
            time,
            answer: guess,
            solution: precedent.result,
            right,
            details: {
                dotLength: this._details.dotLength,
                numbersLength: this._details.numbersLength,
                numberType: this._details.numbersType,
                type: this._details.type
            }
        });

        this._tries.push(right);
        if (this._tries.filter((x) => !x).length === 3) return this.end('3 wrong');

        const calcul = this.generateCalcul();
        this._message.edit(
            this.generateContent(calcul, { result: `${right ? '✅' : '❌'} ${precedent.calcul} = ${precedent.result}` })
        );
    }
    private handlePoints(loosed: boolean, errorsCount: number) {
        if (this.tries.filter((x) => x).length < this.tries.filter((x) => !x).length) return 0;
        if (this.tries.length === 0) return 0;

        const decrement = loosed ? 0 : errorsCount * 5;

        const percent = loosed ? 20 : 70 - decrement;
        const points = Math.floor((this.points * percent) / 100);

        database.addPoints(this._user.id, points);
        return points;
    }
    public end(reason: '3 wrong' | "time's up") {
        if (this._ended) return;
        this._ended = true;

        this.onEnd(this);

        const points = this.handlePoints(reason === '3 wrong', this._tries.filter((x) => !x).length);
        if (reason === '3 wrong') {
            this._message
                .edit({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Perdu')
                            .setDescription(
                                `Vous avez correctement effectué **${this._tries
                                    .filter((x) => x)
                                    .length.toLocaleString()} calculs**`
                            )
                            .setFields(
                                {
                                    name: 'Points',
                                    value: `${points.toLocaleString()} points`,
                                    inline: true
                                },
                                {
                                    name: 'Temps',
                                    value: `${secondsToWeeks(Math.floor((Date.now() - this.start) / 1000))}`,
                                    inline: true
                                }
                            )
                            .setColor('#ff0000')
                    ],
                    components: [],
                    content: `:x: \`${this.calcul.calcul} = ${this.calcul.result}\``
                })
                .catch(log4js.trace);
        } else {
            this._message
                .edit({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Temps écoulé')
                            .setDescription(
                                `Vous avez correctement effectué **${this._tries
                                    .filter((x) => x)
                                    .length.toLocaleString()} calculs**`
                            )
                            .setFields(
                                {
                                    name: 'Points',
                                    value: `${points.toLocaleString()} points`,
                                    inline: true
                                },
                                {
                                    name: 'Temps',
                                    value: `${secondsToWeeks(Math.floor((Date.now() - this.start) / 1000))}`,
                                    inline: true
                                },
                                {
                                    name: 'Erreurs',
                                    value: this._tries.filter((x) => !x).length.toLocaleString(),
                                    inline: true
                                }
                            )
                            .setColor('#00ff00')
                    ],
                    components: []
                })
                .catch(log4js.trace);
        }
    }
    public solve(answer: number) {
        this.edit(answer);
    }
}
export class Sprints {
    private sprints: Collection<string, Sprint> = new Collection();
    private client: Client;

    constructor(client: Client) {
        this.client = client;
        this.load();
    }

    private load() {
        this.client.on('buttonInteraction', async (button) => {
            if (button.customId !== 'sprint-solve') return;

            const sprint = this.sprints.find((x) => x.user.id === button.user.id);
            if (!sprint || sprint.user.id !== button.user.id) {
                button.reply({
                    ephemeral: true,
                    content: "Ce n'est pas votre sprint de calcul"
                });
                return;
            }

            const modal = new ModalBuilder()
                .setTitle('Résoudre')
                .setComponents(
                    new ActionRowBuilder<TextInputBuilder>().setComponents(
                        new TextInputBuilder()
                            .setCustomId('answer')
                            .setLabel('Solution')
                            .setRequired(true)
                            .setPlaceholder('votre réponse')
                            .setStyle(TextInputStyle.Short)
                    )
                )
                .setCustomId('reply-modal');

            await button.showModal(modal).catch(log4js.trace);
            const reply = await button
                .awaitModalSubmit({
                    time: 10000
                })
                .catch(log4js.trace);
            if (!reply) return;

            reply.deferUpdate().catch(log4js.trace);
            const answer = parseFloat(reply.fields.getTextInputValue('answer').replace(/ +/g, '').replace(/,/g, '.'));

            sprint.solve(answer);
        });
    }

    public alreadyStarted(userId: string) {
        return this.sprints.has(userId);
    }
    public start({
        user,
        interaction,
        time,
        ...details
    }: {
        user: User;
        interaction: CommandInteraction;
        time: number;
        type: CalcType;
        dotLength: DotLength;
        numbersLength: NumberLength;
        numbersType: NumbersType;
        hasZero: boolean;
    }) {
        if (this.alreadyStarted(user.id)) return;

        const sprint = new Sprint({
            interaction,
            user,
            time,
            details
        });
        sprint.listenEnd((sp) => {
            this.sprints.delete(user.id);
        });

        this.sprints.set(user.id, sprint);

        setTimeout(() => {
            sprint.end("time's up");
        }, time);
    }
}
