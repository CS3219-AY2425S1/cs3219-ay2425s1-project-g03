// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config({
    files: ['**/*.ts'],
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.strict,
        ...tseslint.configs.stylistic,
        eslintPluginPrettierRecommended,
    ],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        // https://stackoverflow.com/questions/68816664/get-rid-of-error-delete-eslint-prettier-prettier-and-allow-use-double
        'prettier/prettier': [
            'error',
            {
                'endOfLine': 'auto',
            }
        ]
    },
});
