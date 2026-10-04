/**
 * @typedef {import('./pager').default} Pager
 * @typedef {import('./pager.types').PagerConfigType} PagerConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<PagerConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<PagerConfigType>} Story
 */
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
import { attrString, getURLParam } from '@arpadroid/tools';
import { waitFor, userEvent, expect, fireEvent } from 'storybook/test';

const html = String.raw;
/** @type {Meta} */
const PagerStory = {
    title: 'UI/Pager',
    tags: [],
    args: {
        className: 'pager',
        currentPage: 2,
        totalPages: 100,
        maxNodes: 7,
        hasArrowControls: true,
        hasInput: false,
        urlParam: 'page',
        ariaLabel: 'Test pager'
    },
    component: 'arpa-pager',
    render: args => html`
        <arpa-pager id="demo-pager" ${attrString(args)} views="grid, list"></arpa-pager>

        <script type="module">
            await customElements.whenDefined('arpa-pager');
            const pager = document.getElementById('demo-pager');
            pager.onChange(({ page }) => {
                pager.setPager(page);
                const url = new URL(window.location.href);
                url.searchParams.set('page', page);
                window.history.pushState({}, '', url.href);
            });
        </script>
    `
};

/** @type {Story} */
export const Default = {
    name: 'Render',
    parameters: defaultParams
};

/** @type {Story} */
export const Test = {
    parameters: testParams,
    play: async ({ canvas, canvasElement, step }) => {
        await customElements.whenDefined('arpa-pager');

        const pagerNode = /** @type {Pager} */ (canvasElement.querySelector('arpa-pager'));
        await pagerNode?.promise;

        await step('Renders the pager with the given props', async () => {
            await waitFor(() => {
                const pagination = canvas.getByRole('navigation', { name: /Test pager/i });
                expect(pagination).toBeInTheDocument();
                expect(pagination).toHaveClass('pager');
                expect(pagination).toHaveAttribute('aria-label', 'Test pager');
            });
        });

        await step(
            'Checks that the pager has the correct number of items dictated by max-nodes property',
            async () => {
                const itemsNode = pagerNode.querySelector('.pager__numbers');
                expect(itemsNode?.children).toHaveLength(7);
            }
        );

        await step('Renders the input field for the selected item', async () => {
            await waitFor(() => {
                const input = canvas.getByRole('spinbutton', { name: /Current page/i });
                expect(input).toBeInTheDocument();
                expect(input).toHaveAttribute('type', 'number');
                expect(input).toHaveAttribute('name', 'page');
                expect(input).toHaveAttribute('value', '2');
                expect(input).toHaveAttribute('min', '1');
                expect(input).toHaveAttribute('max', '100');
            });
        });

        await step('Clicks on the next button', async () => {
            const nextLink = canvas.getByRole('link', { name: /Next page/i });
            const currentPage = pagerNode.getCurrentPage();
            expect(currentPage).toBe(2);
            await userEvent.click(nextLink);
            await waitFor(() => {
                expect(nextLink).toHaveAttribute('data-page', '4');
                const currentPage = getURLParam('page');
                expect(currentPage).toBe('3');
                expect(pagerNode.getCurrentPage()).toBe(3);
            });
        });

        await step('Clicks on the previous button', async () => {
            const prevButton = canvas.getByRole('link', { name: /Previous page/i });
            await userEvent.click(prevButton);
            await waitFor(() => {
                expect(pagerNode).toHaveAttribute('current-page', '2');
                const currentPage = getURLParam('page');
                expect(currentPage).toBe('2');
                expect(pagerNode.getCurrentPage()).toBe(2);
            });
        });

        await step('Clicks on the last button', async () => {
            const lastButton = canvas.getByRole('link', { name: /100/i });
            await userEvent.click(lastButton);
            await waitFor(() => {
                expect(pagerNode).toHaveAttribute('current-page', '100');
                const currentPage = getURLParam('page');
                expect(currentPage).toBe('100');
                expect(pagerNode.getCurrentPage()).toBe(100);
            });
        });

        await step('Clicks next and loops back to the first page', async () => {
            /** @type {HTMLAnchorElement} */
            const nextButton = canvas.getByRole('link', { name: /Next page/i });
            await waitFor(() => {
                expect(getURLParam('page', nextButton.href)).toBe('1');
            });
            await userEvent.click(nextButton);
            await waitFor(() => {
                expect(pagerNode).toHaveAttribute('current-page', '1');
                const currentPage = getURLParam('page');
                expect(currentPage).toBe('1');
                expect(pagerNode.getCurrentPage()).toBe(1);
            });
        });

        await step(
            'Clicks on the first button and focuses inside an input, types 50 and sets page with enter key.',
            async () => {
                await waitFor(() => {
                    expect(canvasElement.querySelector('pager-item[page="1"] input')).toBeInTheDocument();
                });
                const input = canvasElement.querySelector('pager-item[page="1"] input');
                if (!(input instanceof HTMLElement)) {
                    throw new Error('Expected pager input element to exist');
                }
                const form = input.closest('form, arpa-form');
                if (!(form instanceof Element)) {
                    throw new Error('Expected pager form element to exist');
                }
                await userEvent.clear(input);
                await userEvent.type(input, '50');
                await fireEvent.submit(form);
                await waitFor(() => {
                    expect(pagerNode).toHaveAttribute('current-page', '50');
                    const currentPage = getURLParam('page');
                    expect(currentPage).toBe('50');
                    expect(pagerNode.getCurrentPage()).toBe(50);
                    expect(canvas.getByRole('link', { name: /49/i })).toBeInTheDocument();
                    expect(canvas.getByRole('link', { name: /51/i })).toBeInTheDocument();
                });
            }
        );
    }
};

export default PagerStory;
