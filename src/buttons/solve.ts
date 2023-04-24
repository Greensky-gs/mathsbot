import { ButtonHandler, log4js } from 'amethystjs';
import calculs from '../maps/calculs';
import { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ActionRowBuilder } from '@discordjs/builders';
import { calculatePoints, secondsToWeeks } from '../utils/toolbox';
import database from '../maps/database';

export default new ButtonHandler({
    customId: 'solve'
}).setRun(async ({ button, message, user }) => {
    const calcul = calculs.get(message.id);

    if (!calcul) {
        message
            .edit({
                components: []
            })
            .catch(log4js.trace);

        message
            .edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Calcul introuvable')
                        .setDescription(`Je n'ai pas trouvé ce calcul dans le cache`)
                        .setColor('#ff0000')
                        .setTimestamp()
                ]
            })
            .catch(log4js.trace);
        return;
    }

    if (user.id !== calcul.userId)
        return button
            .reply({
                ephemeral: true,
                content: "Ce n'est pas votre calcul"
            })
            .catch(log4js.trace);

    const modal = new ModalBuilder()
        .setTitle('Calcul')
        .setComponents(
            new ActionRowBuilder<TextInputBuilder>().setComponents(
                new TextInputBuilder()
                    .setLabel('Réponse')
                    .setPlaceholder('Votre réponse au calcul')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
                    .setCustomId('reply')
            )
        )
        .setCustomId('solving');

    await button.showModal(modal).catch(log4js.trace);

    const reply = await button
        .awaitModalSubmit({
            time: 120000
        })
        .catch(log4js.trace);

    if (!reply) return;

    reply.deferUpdate();
    const response = parseFloat(reply.fields.getTextInputValue('reply').replace(/,/g, '.'));
    const solution = eval(calcul.calculation);

    const time = Math.floor((Date.now() - calcul.start) / 1000);
    const points = calculatePoints({
        details: calcul.details,
        answer: response,
        solution,
        time,
        right: response === solution
    });
    calculs.delete(message.id);
    database.addPoints(user.id, points);

    if (response === solution) {
        message
            .edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Calcul réussi')
                        .setDescription(
                            `Vous avez correctement réussi le calcul !\n\`\`\`${calcul.calculation} = ${solution}\`\`\``
                        )
                        .setColor('#00ee00')
                        .setTimestamp()
                        .setFooter({ text: user.username, iconURL: user.displayAvatarURL({ forceStatic: false }) })
                        .setFields(
                            {
                                name: 'Temps',
                                value: secondsToWeeks(time),
                                inline: true
                            },
                            {
                                name: 'Points',
                                value: `${points.toLocaleString('fr')} points`,
                                inline: true
                            }
                        )
                ],
                components: []
            })
            .catch(log4js.trace);
    } else {
        message
            .edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Calcul échoué')
                        .setDescription(`Vous vous êtes trompé !\n\`\`\`${calcul.calculation} = ${solution}\`\`\``)
                        .setColor('#ff0000')
                        .setTimestamp()
                        .setFooter({ text: user.username, iconURL: user.displayAvatarURL({ forceStatic: false }) })
                        .setFields(
                            {
                                name: 'Temps',
                                value: secondsToWeeks(time),
                                inline: true
                            },
                            {
                                name: 'Points',
                                value: `${points.toLocaleString('fr')} points`,
                                inline: true
                            }
                        )
                ],
                components: []
            })
            .catch(log4js.trace);
    }
});
