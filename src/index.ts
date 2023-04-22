import { AmethystClient } from 'amethystjs';
import { config } from 'dotenv';

config();

const client = new AmethystClient(
    {
        intents: ['Guilds']
    },
    {
        token: process.env.token,
        commandsFolder: './dist/commands',
        eventsFolder: './dist/events',
        buttonsFolder: './dist/buttons',
        debug: true
    }
);

client.start({});
