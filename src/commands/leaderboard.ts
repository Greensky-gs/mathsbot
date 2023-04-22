import { AmethystCommand, log4js } from 'amethystjs';
import database from '../maps/database';
import { Paginator } from 'dsc-pagination';
import { EmbedBuilder } from 'discord.js';

export default new AmethystCommand({
    name: 'classement',
    description: 'Affiche le classement'
}).setChatInputRun(async ({ interaction }) => {
    const leaderboard = database.leaderboard;

    const add = (embed: EmbedBuilder, el: (typeof leaderboard)[0], index: number) => {
        embed.setDescription(
            `${embed.data.description}\n${index.toLocaleString()}. <@${el.userId}> : ${(
                (el.succeeded / el.played) *
                100
            ).toFixed(0)}%`
        );
    };
    const embed = () => {
        return new EmbedBuilder()
            .setTitle('Classement')
            .setDescription(`Voici le classement des personnes réussissant le plus de calculs`)
            .setColor('Orange');
    };
    if (leaderboard.length < 10) {
        const lb = embed();
        leaderboard.forEach((el, i) => {
            add(lb, el, i + 1);
        });

        interaction
            .reply({
                embeds: [lb]
            })
            .catch(log4js.trace);
    } else {
        const embeds = [embed()];

        leaderboard.forEach((el, i) => {
            if (i % 10 === 0 && i > 0) {
                embeds.push(embed());
            }

            add(embeds[embeds.length - 1], el, i * embeds.length + 1);
        });

        new Paginator({
            embeds,
            numeriseLocale: 'fr',
            user: interaction.user,
            interaction,
            invalidPageContent: (max) => ({
                ephemeral: true,
                content: `Veuillez choisir un nombre entre **1** et **${max}**`
            }),
            displayPages: 'footer'
        });
    }
});
