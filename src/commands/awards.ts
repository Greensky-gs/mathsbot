import { AmethystCommand } from "amethystjs";
import database from "../maps/database";
import { award, awardType } from "../typings/awards";
import { EmbedBuilder } from "discord.js";

export default new AmethystCommand({
    name: 'records',
    description: "Affiche les records de vitesse"
}).setChatInputRun(async({ interaction }) => {
    const awards = database.awards;
    const map = (award: award, type: awardType) => {
        const keys: Record<awardType, string> = {
            addition: 'Addition',
            division: 'Division',
            multiplication: 'Multiplication',
            soustraction: 'Soustraction'
        };
        return `${type} : ${award ? `<@${award.userId}> avec ${award.amount} calculs en ${award.seconds} secondes` : 'Non défini'}`;
    }

    const embed = new EmbedBuilder()
        .setTitle("Records")
        .setDescription(`Voici les records de vitesse de calcul :\n${Object.keys(awards).map(k => map(awards[k], k as awardType)).join('\n')}`)
        .setColor('Orange')
        .setTimestamp()
    
    interaction.reply({
        embeds: [ embed ]
    }).catch(() => {});
})