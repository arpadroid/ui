/**
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 * @typedef {import('@storybook/web-components-vite').Args} Args
 * @typedef {import('../dialogs/dialogs').default} Dialogs
 * @typedef {import('../dialog/dialog').default} Dialog
 */
import { attrString } from '@arpadroid/tools';

const html = String.raw;

export const dialogText =
    'In the depths of the ocean, scientists discovered an ancient ecosystem thriving around hydrothermal vents. These towering underwater chimneys spew hot, mineral-rich water, supporting unique life forms—giant tube worms, ghostly shrimp, and bacteria that convert chemicals into energy. This alien-like world, hidden beneath miles of water, may hold secrets to understanding life beyond Earth.';

/**
 * Plays the test scenario.
 * @returns {Promise<{ dialogNode: Dialog , dialogsNode: Dialogs }>}
 */
export const playSetup = async () => {
    await customElements.whenDefined('arpa-dialog');
    await customElements.whenDefined('arpa-dialogs');
    await new Promise(resolve => setTimeout(resolve, 50)); // Wait for the dialog to be rendered
    const dialogsNode = /** @type {Dialogs} */ (document.querySelector('arpa-dialogs'));
    const dialogNode = /** @type {Dialog} */ (document.querySelector('arpa-dialog'));
    return { dialogNode, dialogsNode };
};

/**
 * Renders the dialog component.
 * @param {Args} args
 * @param {string} dialogType
 * @returns {string}
 */
export const renderDialog = (args, dialogType = 'arpa-dialog') => {
    const zoneTitle = args.zoneTitle;
    delete args.zoneTitle;
    const zoneContent = args.zoneContent || dialogText;
    delete args.zoneContent;
    const zoneFooter = args.zoneFooter;
    delete args.zoneFooter;
    return html`
        <arpa-dialogs>
            <${dialogType} ${attrString(args)}>
                <arpa-zone name="title">${zoneTitle || ''}</arpa-zone>
                <arpa-zone name="content">${zoneContent || ''}</arpa-zone>
                <arpa-zone name="footer">${zoneFooter || ''}</arpa-zone>
            </${dialogType}>
        </arpa-dialogs>
    `;
};
