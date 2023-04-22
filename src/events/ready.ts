import { AmethystEvent } from 'amethystjs';
import { ActivityType } from 'discord.js';

export default new AmethystEvent('ready', (client) => {
    client.user.setActivity({
        name: 'des calculs',
        type: ActivityType.Watching
    });
});
