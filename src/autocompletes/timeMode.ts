import { AutocompleteListener } from 'amethystjs';
import { times } from '../typings/battle';

export default new AutocompleteListener({
    commandName: [{ commandName: 'bataille' }],
    listenerName: 'Mode de temps',
    run: ({ focusedValue }) => {
        const selected = Object.keys(times).filter(
            (k: keyof typeof times) =>
                times[k].name.toLowerCase().includes(focusedValue.toLowerCase()) ||
                focusedValue.toLowerCase().includes(times[k].name.toLowerCase())
        );

        return selected.map((k: keyof typeof times) => ({
            name: `${times[k].name} ( ${times[k].time}+${times[k].increment * 60} )`,
            value: k
        }));
    }
});
