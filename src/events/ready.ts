import { AmethystEvent, log4js } from 'amethystjs';
import { ActivityType } from 'discord.js';

export default new AmethystEvent('ready', (client) => {
    client.user.setActivity({
        name: 'des calculs',
        type: ActivityType.Watching
    });

    process.on('unhandledRejection', (reason) => {
        log4js.trace(reason);
    });
    process.on('uncaughtExceptionMonitor', (error) => {
        log4js.trace(error);
    });
    process.on('uncaughtException', (error) => {
        log4js.trace(error);
    });
});
