/** @type {import('@arpadroid/module').BuildConfigType} */
const config = {
    buildType: 'uiComponent',
    buildTypes: true,
    storybook_port: 6001,
    buildManifest: false,
    logo: `           ┓    • ┓    •
  ┏┓┏┓┏┓┏┓┏┫┏┓┏┓┓┏┫  ┓┏┓
  ┗┻┛ ┣┛┗┻┗┻┛ ┗┛┗┗┻  ┗┻┗
------┛--------------------`,
    storybook: {
        preview: {
            parameters: {
                layout: 'centered'
            }
        }
    }
};

export default config;
