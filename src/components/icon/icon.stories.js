/**
 * @typedef {import('./icon').default} Icon
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 */
import { attrString } from '@arpadroid/tools';
import { expect } from 'storybook/test';
import { testParams, defaultParams } from '@arpadroid/module/storybook/helper';

const html = String.raw;

/** @type {Meta} */
const IconStory = {
    title: 'UI/Icon',
    component: 'arpa-icon',
    args: { icon: 'sailing' },
    argTypes: {
        icon: { control: { type: 'text' }, table: { category: 'Icon Props' } }
    },
    render: args => {
        const icon = args.icon;
        delete args.icon;
        return html`<arpa-icon ${attrString(args)}>${icon}</arpa-icon>`;
    }
};

export const Render = {
    parameters: defaultParams
};

/** @type {StoryObj} */
export const Test = {
    parameters: testParams,
    play: async ({ canvasElement, step }) => {
        await customElements.whenDefined('arpa-icon');
        /** @type {Icon | null} */
        const iconNode = canvasElement.querySelector('arpa-icon');

        await step('renders the icon', async () => {
            expect(iconNode).not.toBeNull();
        });
    }
};

export default IconStory;
