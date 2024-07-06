import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';
const html = String.raw;
const ImageStory = {
    title: 'Components/Image',
    tags: [],
    getArgs: () => ({
        src: 'http://museovaquero.local/api/image/convert?source=%2Fcmsx%2Fassets%2Fhqrvutmy_museovaquero_assets%2Fgallery%2Fimages%2F414.jpg&width=2500&height=2500&quality=70',
        alt: '',
        caption: 'Image caption',
        icon: 'crop_original',
        lazyLoad: false,
    }),
    getArgTypes: (category = 'Image Props') => ({
        src: { control: { type: 'text' }, table: { category } },
        alt: { control: { type: 'text' }, table: { category } },
        icon: { control: { type: 'text' }, table: { category } },
        caption: { control: { type: 'text' }, table: { category } },
        sizes: { control: { type: 'text' }, table: { category } },
        lazyLoad: { control: { type: 'boolean' }, table: { category } },
        showPreloader: { control: { type: 'boolean' }, table: { category } },
    }),
    render: args => {
        return html`<arpa-image ${attrString(args)}>${args.content}</arpa-image>`;
    }
};

export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: ImageStory.getArgs()
};

export const Test = {
    ...Default,
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-image');
        const preloader = canvasElement.querySelector('arpa-image');
        return { canvas, preloader };
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Test.playSetup(canvasElement);
        const { preloader } = setup;
        await step('renders the image preloader text', async () => {
            await waitFor(() => expect(preloader).not.toBeNull());
        });
    }
};

export default ImageStory;
