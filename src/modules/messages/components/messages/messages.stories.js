import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';
const html = String.raw;
const MessagesStory = {
    title: 'Modules/Messages/Messages',
    tags: [],
    getArgs: () => {
        return {
            prependNewMessages: false
        };
    },
    getArgTypes: (category = 'Messages Props') => {
        return {
            prependNewMessages: { control: { type: 'boolean' }, table: { category } }
        };
    },
    render: args => {
        delete args.text;
        return html`
            <arpa-messages id="messages" ${attrString(args)}>
                <arpa-message text="This is a test message" can-close truncate-content="30"></arpa-message>
                <info-message text="This is an info message"></info-message>
                <success-message text="This is a success message"></success-message>
                <warning-message text="This is a warning message"></warning-message>
                <error-message text="This is an error message"></error-message>
            </arpa-messages>
        `;
    }
};

export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: MessagesStory.getArgTypes(),
    args: { ...MessagesStory.getArgs() }
};

export const Test = {
    args: Default.args,
    parameters: {},
    args: {
        ...Default.args,
        canClose: true,
        truncateContent: 30,
        title: 'Messages Test',
        prependNewMessages: true
    },
    parameters: {
        controls: { disable: true },
        usage: { disable: true },
        options: { selectedPanel: 'storybook/interactions/panel' }
    },
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-messages');
        const messagesNode = canvasElement.querySelector('arpa-messages');
        return { canvas, messagesNode };
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Test.playSetup(canvasElement);
        const { canvas, messagesNode } = setup;
        const resource = messagesNode.resource;
        await step('Renders the messages', async () => {
            await waitFor(() => {
                expect(canvas.getByText('This is a test message')).toBeTruthy();
                expect(canvas.getByText('This is an info message')).toBeTruthy();
                expect(canvas.getByText('This is a success message')).toBeTruthy();
                expect(canvas.getByText('This is a warning message')).toBeTruthy();
                expect(canvas.getByText('This is an error message')).toBeTruthy();
            });
        });
        const newMessageText = 'This is a new message';
        let newMessage;
        await step('Adds a new message', async () => {
            newMessage = resource.addMessage({ text: newMessageText });
            await waitFor(() => {
                const newMessage = canvas.getByText(newMessageText);
                expect(newMessage).toBeTruthy();
                const messageWrapper = newMessage.closest('info-message');
                expect(messagesNode.children[0]).toBe(messageWrapper);
            });
        });

        await step('Deletes the new message', async () => {
            resource.deleteMessage(newMessage);
            await waitFor(() => {
                expect(canvas.queryByText(newMessageText)).toBeNull();
            });
        });

        await step('Deletes all messages', async () => {
            resource.deleteMessages();
            await waitFor(() => {
                expect(messagesNode.children.length).toBe(0);
            });
        });

        await step('adds multiple messages', async () => {
            resource.addMessages([
                { text: 'This is another new message', type: null },
                { text: newMessageText }
            ]);
            await waitFor(() => {
                expect(canvas.getByText('This is a new message')).toBeTruthy();
                expect(canvas.getByText('This is another new message')).toBeTruthy();
            });
        });
    }
};

export default MessagesStory;
