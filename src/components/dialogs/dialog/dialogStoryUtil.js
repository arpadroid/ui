// @ts-nocheck
/* eslint-disable sonarjs/no-duplicate-string */
import { within } from '@storybook/test';
import { attrString } from '@arpadroid/tools';

const html = String.raw;

export const dialogText =
    'In the depths of the ocean, scientists discovered an ancient ecosystem thriving around hydrothermal vents. These towering underwater chimneys spew hot, mineral-rich water, supporting unique life forms—giant tube worms, ghostly shrimp, and bacteria that convert chemicals into energy. This alien-like world, hidden beneath miles of water, may hold secrets to understanding life beyond Earth.';

export const playSetup = async canvasElement => {
    const canvas = within(canvasElement);
    await customElements.whenDefined('arpa-dialog');
    await customElements.whenDefined('arpa-dialogs');
    const dialogsNode = document.querySelector('arpa-dialogs');
    const dialogNode = document.querySelector('arpa-dialog');
    return { canvas, dialogNode, dialogsNode };
};

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
                <zone name="title">${zoneTitle || ''}</zone>
                <zone name="content">${zoneContent || ''}</zone>
                <zone name="footer">${zoneFooter || ''}</zone>
            </${dialogType}>
        </arpa-dialogs>
    `;
};
