import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { Extension } from '@codemirror/state';
import { php } from '@codemirror/lang-php';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';

export const languageMap: Record<string, Extension> = {
    java: java(),
    javascript: javascript(),
    PHP: php(),
    rust: rust(),
    SQL: sql(),
    python: python(),
    'C++': cpp(),
    go: go(),
};

export const parserMap: Record<string, string> = {
    java: 'java',
    javascript: 'babel',
    php: 'php',
    xml: 'xml',
    rust: 'rust',
    sql: 'sql',
};

export interface LanguageOption {
    label: string;
    value: string;
}
