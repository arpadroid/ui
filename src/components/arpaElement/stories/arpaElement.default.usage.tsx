import React from 'react';
import { StoryContext } from '@storybook/web-components-vite';

export type ArpaElementDefaultUsagePropsType = {
    element: string;
    story: StoryContext;
    code: string;
};

export default function renderUsage(props: ArpaElementDefaultUsagePropsType): React.ReactElement {
    return <>Hello world</>;
}
