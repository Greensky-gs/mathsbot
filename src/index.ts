import { AmethystClient } from 'amethystjs';
import { config } from 'dotenv';
import { Sprints } from './utils/Sprint';

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
        autocompleteListenersFolder: './dist/autocompletes',
        debug: true
    }
);

client.start({});

client.sprints = new Sprints(client);

declare module 'discord.js' {
    interface Client {
        sprints: Sprints;
    }
}
