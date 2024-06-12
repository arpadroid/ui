/**
 * @typedef {import('./navList.js').default} NavList
 */
import { attrString, editURL } from '@arpadroid/tools';
import { expect, fn, waitFor, within } from '@storybook/test';
// import { waitFor, expect, within } from '@storybook/test';

const html = String.raw;
const NavListStory = {
    title: 'Modules/Navigation/NavList',
    tags: [],
    getArgs: () => {
        return {
            id: 'nav-list',
            divider: '',
            variant: ''
        };
    },
    getArgTypes: (category = 'Nav List Props') => {
        return {
            id: { control: { type: 'text' }, table: { category } },
            divider: { control: { type: 'text' }, table: { category } },
            variant: {
                options: ['horizontal', 'vertical', ''],
                control: { type: 'select' },
                table: { category }
            }
        };
    },
    render: args => {
        delete args.text;
        const url = window.parent.location.href;
        return html`
            <nav-list ${attrString(args)}>
                <nav-link link="${editURL(url, { section: 'home' }, false)}" icon="home">Home</nav-link>
                <nav-link link="${editURL(url, { section: 'settings' }, false)}" icon="settings"
                    >Settings</nav-link
                >
                <nav-link link="${editURL(url, { section: 'user' }, false)}" icon="person">User</nav-link>
                <nav-link icon="logout">Logout</nav-link>
                <nav-link icon="smart_toy">No action</nav-link>
            </nav-list>
        `;
    }
};

export const Default = {
    name: 'Vertical',
    parameters: {},
    argTypes: NavListStory.getArgTypes(),
    args: { ...NavListStory.getArgs(), id: 'nav-list', variant: 'vertical' }
};

export const Horizontal = {
    name: 'Horizontal',
    parameters: {},
    argTypes: NavListStory.getArgTypes(),
    args: {
        ...NavListStory.getArgs(),
        variant: 'horizontal',
        divider: '|'
    }
};

export const HorizontalWithSlottedDivider = {
    parameters: {},
    argTypes: NavListStory.getArgTypes(),
    args: {
        ...NavListStory.getArgs(),
        variant: 'horizontal'
    },
    render: args => {
        delete args.text;
        const url = window.parent.location.href;
        const homeURL = editURL(url, { section: 'home' }, false);
        const settingsURL = editURL(url, { section: 'settings' }, false);
        const userURL = editURL(url, { section: 'user' }, false);
        return html`
            <nav-list ${attrString(args)}>
                <slot name="divider">
                    <arpa-icon style="font-size: 22px;">more_vert</arpa-icon>
                </slot>
                <nav-link link="${homeURL}" icon="home">Home</nav-link>
                <nav-link link="${settingsURL}" icon="settings">Settings</nav-link>
                <nav-link link="${userURL}" icon="person">User</nav-link>
            </nav-list>
        `;
    }
};

export const Test = {
    args: Default.args,
    parameters: {},
    args: {
        ...Default.args
    },
    render: args => {
        delete args.text;
        const url = editURL(window.parent.location.href, { section: 'test' }, false);
        return html`
            <nav-list ${attrString(args)}>
                <nav-link link="${url}" icon="home">Test Link</nav-link>
            </nav-list>
        `;
    },
    parameters: {
        controls: { disable: true },
        usage: { disable: true },
        options: { selectedPanel: 'storybook/interactions/panel' }
    },
    /**
     * Create test links for list.
     * @param {NavList} list
     * @returns {void}
     */
    createTestLinks: list => {
        const url = window.parent.location.href;
        const logoutAction = fn();
        list.addItems([
            {
                content: 'Settings',
                icon: 'settings',
                link: editURL(url, { section: 'settings' })
            },
            {
                content: 'User',
                icon: 'smart_toy',
                link: editURL(url, { section: 'user' })
            },
            {
                content: 'Logout',
                icon: 'logout',
                action: logoutAction
            }
        ]);
        return { logoutAction };
    },
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('nav-list');
        const listNode = canvasElement.querySelector('nav-list');
        return { canvas, listNode };
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Test.playSetup(canvasElement);
        const { canvas, listNode } = setup;
        await step('Renders the list', () => {
            expect(listNode).toBeTruthy();
            expect(canvas.getByText('Test Link')).toBeInTheDocument();
        });

        await step('Adds new links to the list and verifies logout action callback', async () => {
            const { logoutAction } = Test.createTestLinks(listNode);
            await waitFor(() => {
                expect(canvas.getByText('Settings')).toBeInTheDocument();
                expect(canvas.getByText('User')).toBeInTheDocument();
                expect(canvas.getByText('Logout')).toBeInTheDocument();
            });
            const logoutButton = canvas.getByRole('button', { label: 'Logout' });
            requestAnimationFrame(() => logoutButton.click());

            await waitFor(() => {
                expect(logoutAction).toHaveBeenCalled();
            });
        });
    }
};

export default NavListStory;
