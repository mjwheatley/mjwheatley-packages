import { spellCheckDocument, type ValidationIssue } from 'cspell-lib';
import { describe, expect, it } from 'vitest';

async function spellCheck(text: string): Promise<ValidationIssue[]> {
  const results = await spellCheckDocument(
    {
      text,
      uri: '',
      languageId: 'plaintext',
      locale: 'en',
    },
    {
      generateSuggestions: false,
    },
    {},
  );

  return results.issues;
}

describe('TicketNumber pattern', () => {
  it('Ignores valid tickets', async () => {
    const issues = await spellCheck('type(scope): [ASDFASDF-123-456] Subject');

    expect(issues).toHaveLength(0);
  });

  it('Catches invalid tickets', async () => {
    // cSpell:ignore ASDFASDF-123-
    const issues = await spellCheck('type(scope): [ASDFASDF-123-] Subject');

    expect(issues).toHaveLength(1);
  });
});

describe('HtmlEntities pattern', () => {
  it('Ignores HTML entities', async () => {
    await expect(spellCheck('Hello&nbsp;World')).resolves.toHaveLength(0);

    await expect(spellCheck('&FakeEntityWithBadSpeling; &nbsp;')).resolves.toHaveLength(0);
  });
});
