import { RuleConfigSeverity, type UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  plugins: ['commitlint-plugin-cspell'],
  rules: {
    'cspell/type': [RuleConfigSeverity.Error, 'always'],
    'cspell/scope': [RuleConfigSeverity.Error, 'always'],
    'cspell/subject': [RuleConfigSeverity.Error, 'always'],
    'cspell/body': [RuleConfigSeverity.Error, 'always'],
    'cspell/footer': [RuleConfigSeverity.Error, 'always'],
    'header-max-length': [RuleConfigSeverity.Error, 'always', 100],
    'body-max-line-length': [RuleConfigSeverity.Error, 'always', 250],
    // This ensures that the scope is always present and follows the correct format.
    'scope-case': [RuleConfigSeverity.Error, 'always', ['lower-case', 'upper-case']],
    // This ensures that the subject is not empty and starts with a lowercase letter.
    'subject-empty': [RuleConfigSeverity.Error, 'never'],
    'subject-case': [RuleConfigSeverity.Error, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    // This rule ensures that the type is one of the conventional commit types and is in lower-case.
    'type-case': [RuleConfigSeverity.Error, 'always', 'lower-case'],
    'type-empty': [RuleConfigSeverity.Error, 'never'],
    'type-enum': [
      RuleConfigSeverity.Error,
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
  },
};

export default config;
