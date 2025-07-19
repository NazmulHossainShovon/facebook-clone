export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: ['1343'],
        },
        astTransformers: {
          before: [
            {
              path: 'node_modules/ts-jest-mock-import-meta',
              options: {
                metaObjectReplacement: {
                  env: { VITE_API_URL: 'http://localhost:3000' },
                },
              },
            },
          ],
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
