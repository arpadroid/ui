import React from 'react';
import { StoryContext } from '@storybook/web-components-vite';

export type ArpaElementUsagePropsType = {
    element: string;
    story: StoryContext;
    code: string;
};

export default function renderUsage(props: ArpaElementUsagePropsType): React.ReactElement {
    return <>Hello world</>;
}
