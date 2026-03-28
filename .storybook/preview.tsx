// import UsageWrapper from '@arpadroid/module/storybook/usageWrapper';

/**
 * Storybook preview configuration.
 * This file imports the preview configuration from the module and exports it.
 * Add your Storybook preview configuration overrides here if needed.
 */
import PreviewConfig from '@arpadroid/module/storybook/preview';

console.log('I am preview');
export default {
    ...PreviewConfig,
    parameters: {
        ...PreviewConfig.parameters
        /**
         * @todo: Implement usage.`
         */
        // usage: props => {
        //     console.log('props', props);
        //     return 'la la land';
        // }
    }
};
