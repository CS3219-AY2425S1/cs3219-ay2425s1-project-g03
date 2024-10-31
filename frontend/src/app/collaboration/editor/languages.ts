import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { Extension } from '@codemirror/state';
import { php } from '@codemirror/lang-php';
import { xml } from '@codemirror/lang-xml';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { python } from '@codemirror/lang-python';
import { angular } from '@codemirror/lang-angular';
import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { go } from '@codemirror/lang-go';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { liquid } from '@codemirror/lang-liquid';
import { markdown } from '@codemirror/lang-markdown';
import { sass } from '@codemirror/lang-sass';
import { vue } from '@codemirror/lang-vue';
import { yaml } from '@codemirror/lang-yaml';

export const languageMap: Record<string, Extension> = {
    java: java(),
    javascript: javascript(),
    PHP: php(),
    XML: xml(),
    rust: rust(),
    SQL: sql(),
    python: python(),
    angular: angular(),
    'C++': cpp(),
    CSS: css(),
    go: go(),
    HTML: html(),
    JSON: json(),
    liquid: liquid(),
    markdown: markdown(),
    sass: sass(),
    vue: vue(),
    YAML: yaml(),
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
