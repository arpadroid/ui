/**
 * @typedef {import('../tooltip').default} Tooltip
 * @typedef {import('../tooltip.types').TooltipConfigType} TooltipConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<TooltipConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<TooltipConfigType>} Story
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect } from 'storybook/test';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';

const html = String.raw;
const content =
    'You can use the "handler" property to specify the element that will trigger the tooltip. If no handler is specified, the tooltip will create its own default handler.';

/** @type {Meta} */
const TooltipStory = {
    title: 'UI/Tooltip',
    tags: [],
    component: 'arpa-tooltip',
    render: args => html` <arpa-tooltip ${attrString(args)}>${content}</arpa-tooltip> `
};

/** @type {Story} */
export const Default = {
    ...TooltipStory,
    name: 'Render',
    parameters: defaultParams
};

/**
 * Sets up the testing environment for the Tooltip component.
 * @param {HTMLElement} canvasElement - The canvas element containing the tooltip component.
 * @returns {Promise<{tooltipNode: Tooltip | null}>}
 */
async function playSetup(canvasElement) {
    await customElements.whenDefined('arpa-tooltip');
    /** @type {Tooltip | null} */
    const tooltipNode = canvasElement.querySelector('arpa-tooltip');
    return { tooltipNode };
}

/** @type {Story} */
export const Test = {
    parameters: testParams,
    play: async ({ canvasElement, step, canvas }) => {
        await playSetup(canvasElement);
        const contentNode = await waitFor(() => canvas.getByText(content));
        await step('renders the tooltip', async () => {
            const handler = canvas.getByRole('button');
            expect(handler).toBeInTheDocument();
            handler.focus();
            expect(contentNode).toBeVisible();
        });
    }
};

/** @type {Story} */
export const ShortText = {
    parameters: testParams,
    args: {
        position: 'left'
    },
    render: args => html` <arpa-tooltip ${attrString(args)}>Short text</arpa-tooltip> `,
    play: async ({ canvasElement, step, canvas }) => {
        await playSetup(canvasElement);
        const contentNode = await waitFor(() => canvas.getByText('Short text'));
        await step('renders the tooltip', async () => {
            const handler = canvas.getByRole('button');
            expect(handler).toBeInTheDocument();
            handler.focus();
            expect(contentNode).toBeVisible();
        });
    }
};

const buttonTooltipContent =
    'A tooltip within a button or link will automatically use the button as its handler.';

/** @type {Story} */
export const ButtonWithTooltip = {
    parameters: testParams,
    args: {
        handler: '',
        content: ''
    },
    render: args => {
        return html`
            <arpa-button>
                Custom Button with Tooltip
                <arpa-tooltip ${attrString(args)}>${buttonTooltipContent}</arpa-tooltip>
            </arpa-button>
        `;
    },
    play: async ({ canvasElement, step, canvas }) => {
        await playSetup(canvasElement);
        const contentNode = await waitFor(() => canvas.getByText(buttonTooltipContent));
        await step('renders the tooltip', async () => {
            const handler = canvas.getByRole('button');
            expect(handler).toBeInTheDocument();
            handler.focus();
            expect(contentNode).toBeVisible();
        });
    }
};

/** @type {Story} */
export const CustomHandler = {
    parameters: testParams,
    args: {
        position: 'bottom'
    },
    render: args => {
        return html`
            <arpa-tooltip ${attrString(args)}>
                <div class="tooltip__handler">
                    <input
                        class="fieldInput"
                        type="text"
                        id="custom-handler"
                        placeholder="Focus to see tooltip"
                    />
                </div>
                You can declare an existing element as the tooltip handler by adding the
                <strong>tooltip__handler</strong>
                class to it.
            </arpa-tooltip>
        `;
    },
    play: async ({ canvasElement, step, canvas }) => {
        await playSetup(canvasElement);
        const contentNode = await waitFor(() =>
            canvas.getByText('You can declare an existing element', { exact: false })
        );
        await step('renders the tooltip', async () => {
            const handler = canvas.getByRole('textbox');
            expect(handler).toBeInTheDocument();
            handler.focus();
            expect(contentNode).toBeVisible();
        });
    }
};

export default TooltipStory;
