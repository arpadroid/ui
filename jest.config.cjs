module.exports = {
    coverageReporters: ['html', 'text', 'cobertura'],
    fakeTimers: { enableGlobally: true },
    globals: {},
    injectGlobals: true,
    moduleFileExtensions: ['js', 'mjs'],
    setupFilesAfterEnv: ['<rootDir>/node_modules/@arpadroid/module/src/jest/jest.setup.cjs'],
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.?(m)js?(x)', '**/?(*.)(spec|test).?(m)js?(x)'],
    transform: { '^.+\\.m?js$': 'babel-jest' },
    transformIgnorePatterns: ['node_modules/(?!@arpadroid/tools)'],
    verbose: true,
    reporters: [
        'default',
        [
            'jest-junit',
            {
                // outputDirectory: "",
                outputName: 'junit.xml'
            }
        ]
    ]
};
