import parser from '@typescript-eslint/parser';
export default [{ignores:['node_modules/**','.next/**']},{files:['**/*.ts','**/*.tsx'],
 languageOptions:{parser,parserOptions:{ecmaVersion:'latest',sourceType:'module',ecmaFeatures:{jsx:true}}},
 rules:{'no-unreachable':'error','no-dupe-keys':'error','no-func-assign':'error','valid-typeof':'error'}}];
