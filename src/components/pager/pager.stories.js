/* eslint-disable sonarjs/no-duplicate-string */
/**
 * @typedef {import('./list.js').default} List
 */
import { attrString, getURLParam } from '@arpadroid/tools';
import { waitFor, userEvent, fireEvent, expect, within } from '@storybook/test';

const html = String.raw;
const PagerStory = {
    title: 'Components/Pager',
    tags: [],
    getArgs: () => {
        return {
            className: 'pager',
            currentPage: 2,
            totalPages: 10,
            maxNodes: 7,
            hasArrowControls: true,
            hasInput: false,
            urlParam: 'page'
        };
    },
    getArgTypes: (category = 'Pager Props') => {
        return {
            title: { control: { type: 'text' }, table: { category } },
            className: { control: { type: 'text' }, table: { category } },
            currentPage: { control: { type: 'number' }, table: { category } },
            totalPages: { control: { type: 'number' }, table: { category } },
            maxNodes: { control: { type: 'number' }, table: { category } },
            hasArrowControls: { control: { type: 'boolean' }, table: { category } },
            hasInput: { control: { type: 'boolean' }, table: { category } },
            urlParam: { control: { type: 'text' }, table: { category } }
        };
    },
    render: args => html`
        <arpa-pager id="demo-pager" ${attrString(args)} views="grid, list"></arpa-pager>

        <script type="module">
            import { editURL } from '/arpadroid-tools.js';
            await customElements.whenDefined('arpa-pager');
            const pager = document.getElementById('demo-pager');
            pager.onChange(({ page }) => {
                pager.setPager(page);
                const newURL = editURL(window.location.href, { page });
                window.history.pushState({}, '', newURL);
            });
        </script>
    `
};

export const Default = {
    name: 'Render',
    parameters: {},
    args: PagerStory.getArgs()
};

export const Test = {
    args: Default.args,
    parameters: {},
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
    parameters: {
        controls: { disable: true },
        usage: { disable: true },
        options: { selectedPanel: 'storybook/interactions/panel' }
    },
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-pager');
        const pagerNode = canvasElement.querySelector('arpa-pager');
        await pagerNode.promise;
        return { canvas, pagerNode };
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Test.playSetup(canvasElement);
        const { canvas, pagerNode } = setup;

        await step('Renders the pager with the given props', async () => {
            const pagination = canvas.getByRole('navigation', { name: /Test pager/i });
            expect(pagination).toBeInTheDocument();
            expect(pagination).toHaveClass('pager');
            expect(pagination).toHaveAttribute('aria-label', 'Test pager');
        });

        await step(
            'Checks that the pager has the correct number of items dictated by max-nodes property',
            async () => {
                const numbersNode = pagerNode.querySelector('.pager__numbers');
                expect(numbersNode.children).toHaveLength(7);
            }
        );

        await step('Renders the input field for the selected item', async () => {
            const input = canvas.getByRole('spinbutton', { name: /Current page/i });
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'number');
            expect(input).toHaveAttribute('name', 'page');
            expect(input).toHaveAttribute('value', '2');
            expect(input).toHaveAttribute('min', '1');
            expect(input).toHaveAttribute('max', '100');
        });

        await step('Clicks on the next button', async () => {
            const nextLink = canvas.getByRole('link', { name: /Next page/i });
            const currentPage = pagerNode.getCurrentPage();
            expect(currentPage).toBe(2);
            nextLink.click();
            await waitFor(() => {
                expect(nextLink).toHaveAttribute('data-page', '3');
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
                const form = input.closest('form');
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
