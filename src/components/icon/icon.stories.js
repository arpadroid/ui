/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';
import { getArgs, getArgTypes, playSetup } from './icon.stories.util';

const html = String.raw;

/** @type {Meta} */
const IconStory = {
    title: 'UI/Components/Icon',
    tags: [],
    render: args => {
        const icon = args.icon;
        delete args.icon;
        return html`<arpa-icon ${attrString(args)}>${icon}</arpa-icon>`;
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: getArgTypes(),
    args: getArgs(),
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { iconNode } = setup;
        /** @type {{icon?: string}} */
        const { icon = '' } = Default.args || {};
        // @ts-ignore
        iconNode.icon = icon;

        await step('renders the icon', async () => {
            await waitFor(() => expect(iconNode).not.toBeNull());
        });
    }
};

export default IconStory;
