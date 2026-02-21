/**
 * @typedef {import('./button').default} Button
 */
import { within } from 'storybook/test';

/**
 * Sets a new icon on the button component and checks if it is rendered correctly.
 * @param {HTMLElement} canvasElement - The canvas element containing the button component.
 * @returns {Promise<{canvas: any, buttonNode: HTMLButtonElement, buttonComponent: Button}>}
 */
export async function playSetup(canvasElement) {
    const canvas = within(canvasElement);

    await customElements.whenDefined('arpa-button');

    const buttonComponent = /** @type {Button} */ (canvasElement.querySelector('arpa-button'));

    await buttonComponent.promise;

    const buttonNode = /** @type {HTMLButtonElement} */ (canvasElement.querySelector('button'));

    return { canvas, buttonNode, buttonComponent };
}
