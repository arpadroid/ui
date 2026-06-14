/**
 * @typedef {import('./dropArea').default} DropArea
 * @typedef {import('./dropArea.types').DropAreaConfigType} DropAreaConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<DropAreaConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<DropAreaConfigType>} StoryObj
 */

import { expect, fn } from 'storybook/test';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
/** @type {Meta} */
const DropAreaStory = {
    title: 'UI/Drop Area',
    tags: [],
    component: 'drop-area',
    parameters: {
        layout: 'padded'
    }
};

/** @type {StoryObj} */
export const Render = {
    parameters: defaultParams
};

/** @type {StoryObj} */
export const TestSingle = {
    parameters: testParams,
    play: async ({ canvasElement, canvas, step }) => {
        await customElements.whenDefined('drop-area');
        /** @type {DropArea | null} */
        const dropAreaNode = canvasElement.querySelector('drop-area');
        const dropArea = /** @type {DropArea} */ (dropAreaNode);
        await dropArea.promise;
        const handlerNode = dropArea.querySelector('.dropArea__handler');

        await step('renders the drop area', async () => {
            expect(dropAreaNode).toBeInTheDocument();
            expect(canvas.getByText(/Upload File/i)).toBeInTheDocument();
            expect(handlerNode).toBeInTheDocument();
        });

        await step('toggles the active handler class during drag interactions', async () => {
            expect(handlerNode).not.toHaveClass('dropArea__handler--active');

            handlerNode?.dispatchEvent(
                new DragEvent('dragenter', {
                    bubbles: true,
                    cancelable: true
                })
            );

            expect(handlerNode).toHaveClass('dropArea__handler--active');

            handlerNode?.dispatchEvent(
                new DragEvent('dragleave', {
                    bubbles: true,
                    cancelable: true
                })
            );

            expect(handlerNode).not.toHaveClass('dropArea__handler--active');
        });

        await step('handles file drop', async () => {
            const onDrop = fn();

            dropArea.on('drop', onDrop);

            const file = new File(['file content'], 'test-file.txt', { type: 'text/plain' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            const dropEvent = new DragEvent('drop', {
                dataTransfer,
                bubbles: true,
                cancelable: true
            });

            handlerNode?.dispatchEvent(dropEvent);

            expect(onDrop).toHaveBeenCalledTimes(1);
            expect(onDrop.mock.calls[0]?.[0]).toBe(dropEvent);
            expect(onDrop.mock.calls[0]?.[1]).toEqual([file]);
        });

        await step('ignores drops that do not contain files', async () => {
            const onDrop = fn();
            const file = new File(['file content'], 'test-file.txt', { type: 'text/plain' });
            const dropEvent = new Event('drop', {
                bubbles: true,
                cancelable: true
            });

            dropArea.on('drop', onDrop);
            Object.defineProperty(dropEvent, 'dataTransfer', {
                value: {
                    files: [file],
                    types: ['text/plain']
                }
            });

            handlerNode?.dispatchEvent(dropEvent);

            expect(onDrop).not.toHaveBeenCalled();
        });
    }
};

/** @type {StoryObj} */
export const TestMultiple = {
    parameters: testParams,
    play: async ({ canvasElement, step }) => {
        await customElements.whenDefined('drop-area');
        /** @type {DropArea | null} */
        const dropAreaNode = canvasElement.querySelector('drop-area');
        const dropArea = /** @type {DropArea} */ (dropAreaNode);
        await dropArea.promise;
        const handlerNode = dropArea.querySelector('.dropArea__handler');

        await step('handles multiple dropped files', async () => {
            const onDrop = fn();
            const firstFile = new File(['first file content'], 'first-file.txt', {
                type: 'text/plain'
            });
            const secondFile = new File(['second file content'], 'second-file.txt', {
                type: 'text/plain'
            });
            const dataTransfer = new DataTransfer();

            expect(dropAreaNode).toBeInTheDocument();
            expect(handlerNode).toBeInTheDocument();

            dropArea.on('drop', onDrop);
            dataTransfer.items.add(firstFile);
            dataTransfer.items.add(secondFile);

            const dropEvent = new DragEvent('drop', {
                dataTransfer,
                bubbles: true,
                cancelable: true
            });

            handlerNode?.dispatchEvent(dropEvent);

            expect(onDrop).toHaveBeenCalledTimes(1);
            expect(onDrop.mock.calls[0]?.[0]).toBe(dropEvent);
            expect(onDrop.mock.calls[0]?.[1]).toEqual([firstFile, secondFile]);
        });
    }
};


export default DropAreaStory;
