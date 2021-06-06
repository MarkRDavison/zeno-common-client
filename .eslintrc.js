module.exports = {
    parser: '@typescript-eslint/parser',  
    parserOptions: {  
        ecmaVersion: 2020,
        sourceType: 'module'
    },  
    extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier'
    ],  
    rules: {
        'no-console': 'error',
        'semi': 'error',
        'eqeqeq': 'error',
        'quotes': ['error', 'single']
    }  
};