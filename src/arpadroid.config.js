/** @type {import('@arpadroid/module').BuildConfigType} */
const config = {
    buildType: 'uiComponent',
    buildTypes: true,
    buildManifest: true,
    storybook_port: 6001,
    storybook: {
        managerCache: false,
        preview: {
            parameters: {
                layout: 'centered'
            }
        }
    }
};

export default config;
