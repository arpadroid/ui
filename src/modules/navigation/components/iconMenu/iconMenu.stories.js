/**
 * @typedef {import('./navList.js').default} NavList
 */
import { attrString } from '@arpadroid/tools';
import { expect, fireEvent, waitFor, within } from '@storybook/test';

const html = String.raw;
const IconMenuStory = {
    title: 'Modules/Navigation/iconMenu',
    tags: [],
    getArgs: () => {
        return {
            id: 'test-menu'
        };
    },
    getArgTypes: (category = 'Nav List Props') => {
        return {
            id: { control: { type: 'text' }, table: { category } }
        };
    },
    render: args => {
        delete args.text;
        return html`
            <div class="container" style="display:flex; width: 100%;">
                <icon-menu ${attrString(args)}>
                    <nav-link link="/home" icon="home">Home</nav-link>
                    <nav-link link="/settings" icon="settings">Settings</nav-link>
                    <nav-link link="/user" icon="smart_toy">User</nav-link>
                    some content
                </icon-menu>
            </div>
            <script>
                customElements.whenDefined('icon-menu').then(() => {
                    /** @type {List} */
                    const iconMenu = document.querySelector('icon-menu');
                });
            </script>
        `;
    }
};

export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: IconMenuStory.getArgTypes(),
    args: { ...IconMenuStory.getArgs() }
};

export const Test = {
    args: Default.args,
    parameters: {},
    args: {
        ...Default.args
    },
    parameters: {
        controls: { disable: true },
        usage: { disable: true },
        options: { selectedPanel: 'storybook/interactions/panel' }
    },
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await waitFor(() => expect(canvasElement.querySelector('nav-list')).toBeInTheDocument());
        const menuNode = canvasElement.querySelector('icon-menu');
        const navigationNode = canvasElement.querySelector('nav-list');
        return { canvas, menuNode, navigationNode };
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Test.playSetup(canvasElement);
        const { canvas, menuNode, navigationNode } = setup;
        await step('Renders the menu', () => {
            expect(menuNode).toBeTruthy();
            expect(navigationNode).not.toBeVisible();
            expect(canvas.getByText('Home')).toBeInTheDocument();
            expect(canvas.getByText('Settings')).toBeInTheDocument();
            expect(canvas.getByText('User')).toBeInTheDocument();
        });

        await step('Opens the menu', async () => {
            await fireEvent.click(canvas.getByRole('button'));
            await waitFor(() => expect(navigationNode).toBeVisible());
        });

        await step('Closes the menu', async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            await fireEvent.click(canvas.getByRole('button'));
            await waitFor(() => expect(navigationNode).not.toBeVisible());
        });
    }
};

export default IconMenuStory;
