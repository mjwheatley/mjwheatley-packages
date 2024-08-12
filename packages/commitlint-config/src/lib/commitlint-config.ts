import { UserConfig } from '@commitlint/types';

export const commitlintConfig: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // This ensures that the scope is always present and follows the correct format.
    'scope-case': [2, 'always', 'lower-case'],
    // This ensures that the subject is not empty and starts with a lowercase letter.
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    // This rule ensures that the type is one of the conventional commit types and is in lower-case.
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only changes
        'style', // Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'perf', // A code change that improves performance
        'test', // Adding missing tests or correcting existing tests
        'build', // Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
        'ci', // Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
        'chore', // Other changes that don't modify src or test files
        'revert', // Reverts a previous commit
      ],
    ],
    // Custom rule to enforce the presence of a scope.
    // Scope should be the application name such as crm-bridge, documents-api, etc.
    'scope-empty': [2, 'never'],
  },
};
