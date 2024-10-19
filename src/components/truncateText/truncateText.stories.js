import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';
const html = String.raw;
const TruncateTextStory = {
    title: 'Components/Truncate Text',
    tags: [],
    getArgs: () => ({
        maxLength: 40,
        text: 'In the vast expanse of the cosmos, stars are born from clouds of dust, only to collapse and scatter that dust again when they die. Every atom in your body was forged in the heart of a dying star, millions of years before the Earth existed. Yet here you are, a collection of star-stuff, capable of looking up at the night sky and wondering about your origins. The universe is as much within you as it is outside of you.'
    }),
    getArgTypes: (category = 'TruncateText Props') => ({
        maxLength: { control: { type: 'number' }, table: { category } },
        threshold: { control: { type: 'number' }, table: { category } },
        ellipsis: { control: { type: 'text' }, table: { category } },
        text: { control: { type: 'text' }, table: { category } },
        readLessLabel: { control: { type: 'text' }, table: { category } },
        readMoreLabel: { control: { type: 'text' }, table: { category } },
        hasButton: { control: { type: 'boolean' }, table: { category } }
    }),
    render: args => {
        return html`<truncate-text ${attrString(args)}>${args.text}</truncate-text>`;
    }
};

export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: TruncateTextStory.getArgTypes(),
    args: TruncateTextStory.getArgs(),
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('truncate-text');
        const truncateTextNode = canvasElement.querySelector('truncate-text');
        return { canvas, truncateTextNode };
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { truncateTextNode } = setup;
        await step('Renders the truncate text component.', async () => {
            await waitFor(() => expect(truncateTextNode).not.toBeNull());
            expect(truncateTextNode.textContent).toContain('Sample text');
        });
    }
};

export default TruncateTextStory;
