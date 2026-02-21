/**
 * @typedef {import('./iconButton').default} IconButton
 * @typedef {import('@storybook/web-components-vite').ArgTypes} ArgTypes
 */
import { within } from 'storybook/test';

export function getArgs() {
    return { variant: 'primary', icon: 'play_arrow', label: 'Click me!', tooltipPosition: 'right' };
}

/**
 * Sets up the testing environment for the IconButton component.
 * @param {HTMLElement} canvasElement - The canvas element containing the icon button component.
 * @returns {Promise<{canvas: ReturnType<typeof within>, buttonNode?: HTMLButtonElement | null}>}
 */
export async function playSetup(canvasElement) {
    const canvas = within(canvasElement);
    await customElements.whenDefined('arpa-button');
    const buttonNode = canvasElement.querySelector('button');
    return { canvas, buttonNode };
}

/**
 * Returns the argTypes for the IconButton component.
 * @param {string} [category='IconButton Props'] - The category for the argTypes in the Storybook table.
 * @returns {ArgTypes} The generated argTypes for the IconButton component.
 */
export function getArgTypes(category = 'IconButton Props') {
    return {
        icon: { control: { type: 'text' }, table: { category } },
        tooltipPosition: {
            control: { type: 'select' },
            options: ['top', 'bottom', 'left', 'right'],
            table: { category }
        },
        variant: {
            description: 'The field variant.',
            options: ['primary', 'secondary', 'tertiary', 'danger', 'warning'],
            control: { type: 'select' },
            table: { category }
        }
    };
}
