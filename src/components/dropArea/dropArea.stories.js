/**
 * @typedef {import('./dropArea').default} DropArea
 * @typedef {import('./dropArea.types').DropAreaConfigType} DropAreaConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<DropAreaConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<DropAreaConfigType>} StoryObj
 */

import { waitFor, expect } from 'storybook/test';
import { playSetup } from './dropArea.stories.utils';
/** @type {Meta} */
const DropAreaStory = {
    title: 'UI/Components/Drop Area',
    tags: [],
    component: 'drop-area',
    parameters: {
        layout: 'padded'
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { dropAreaNode } = setup;
        await step('renders the drop area', async () => {
            await waitFor(() => expect(dropAreaNode).not.toBeNull());
        });
    }
};

export default DropAreaStory;
