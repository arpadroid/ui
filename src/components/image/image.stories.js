import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';
const html = String.raw;
const ImageStory = {
    title: 'UI/Components/Image',
    tags: [],
    getArgs: () => ({
        src: '/api/image/convert?width=[width]&height=[height]&quality=[quality]&source=/cmsx/assets/hqrvutmy_museovaquero_assets/gallery/images/499.jpg',
        alt: '',
        quality: 80,

        icon: 'crop_original',
        lazyLoad: false,
        hasDropArea: false
    }),
    getArgTypes: (category = 'Image Props') => ({
        src: { control: { type: 'text' }, table: { category } },
        alt: { control: { type: 'text' }, table: { category } },
        icon: { control: { type: 'text' }, table: { category } },
        caption: { control: { type: 'text' }, table: { category } },
        quality: { control: { type: 'number' }, table: { category } },
        size: { control: { type: 'number' }, table: { category } },
        width: { control: { type: 'number' }, table: { category } },
        height: { control: { type: 'number' }, table: { category } },
        sizes: { control: { type: 'text' }, table: { category } },
        lazyLoad: { control: { type: 'boolean' }, table: { category } },
        showPreloader: { control: { type: 'boolean' }, table: { category } },
        hasDropArea: { control: { type: 'boolean' }, table: { category } }
    }),
    render: args => {
        return html`
            <style>
                #storybook-root {
                    height: 100%;
                    width: 100%;
                    max-height: 100%;
                    overflow: auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            </style>

            <arpa-image ${attrString(args)}>${args.content}</arpa-image>
        `;
    }
};

export const Default = {
    name: 'Squared',
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: { ...ImageStory.getArgs(), size: 400, caption: 'Image caption' }
};

export const Portrait = {
    // name: 'Portrait Image',
    parameters: {
        layout: 'centered'
    },
    argTypes: ImageStory.getArgTypes(),
    args: {
        ...ImageStory.getArgs(),
        src: '/api/image/convert?width=[width]&height=[height]&quality=[quality]&source=/cmsx/assets/hqrvutmy_museovaquero_assets/gallery/images/513.jpg',
        width: 270,
        height: 400
    }
};

export const Landscape = {
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: {
        ...ImageStory.getArgs(),
        src: '/api/image/convert?width=[width]&height=[height]&quality=[quality]&source=/cmsx/assets/hqrvutmy_museovaquero_assets/gallery/images/290.jpg',
        width: 320,
        height: 144
    }
};

export const mini = {
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: {
        ...ImageStory.getArgs(),
        src: '/api/image/convert?width=[width]&quality=[quality]&source=/cmsx/assets/hqrvutmy_museovaquero_assets/gallery/images/513.jpg',
        size: 30
    }
};

export const small = {
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: {
        ...ImageStory.getArgs(),
        src: '/api/image/convert?width=[width]&quality=[quality]&source=/cmsx/assets/hqrvutmy_museovaquero_assets/gallery/images/513.jpg',
        size: 100
    }
};

export const NoImage = {
    name: 'No Image',
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: { ...ImageStory.getArgs(), src: '' }
};

export const NotFoundImage = {
    name: 'Not Found Image',
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: {
        ...ImageStory.getArgs(),
        src: '/api/image/convert?width=[width]&height=[height]&quality=[quality]&source=/cmsx/assets/hqrvutmy_museovaquero_assets/gallery/images/not-found.jpg'
    }
};

export const WithPreview = {
    name: 'With Preview',
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: {
        ...ImageStory.getArgs(),
        src: '/api/image/convert?width=[width]&height=[height]&quality=[quality]&source=/cmsx/assets/hqrvutmy_museovaquero_assets/gallery/images/513.jpg',
        width: 50,
        height: 50,
        showPreloader: true,
        hasPreview: true
    }
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
