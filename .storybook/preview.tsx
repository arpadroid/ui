import UsageWrapper from '@arpadroid/module/storybook/usageWrapper';
// @ts-ignore
import PreviewConfig from '@arpadroid/module/storybook/preview';

export default {
    ...PreviewConfig,
    parameters: {
        ...PreviewConfig.parameters,
        // usage: props => {
        //     console.log('props', props);
        //     return 'la la land';
        // }
    }
};
