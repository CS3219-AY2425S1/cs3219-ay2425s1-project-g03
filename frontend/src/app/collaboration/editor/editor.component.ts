import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, Extension } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { DOCUMENT } from '@angular/common';
import { EditorView } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [ScrollPanelModule, ButtonModule],
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.css',
})
export class EditorComponent implements AfterViewInit {
    @ViewChild('editor') editor!: ElementRef;

    state!: EditorState;

    view!: EditorView;

    customTheme!: Extension;

    constructor(@Inject(DOCUMENT) private document: Document) {}

    ngAfterViewInit() {
        this.setTheme();
        this.setEditorState();
        this.setEditorView();
        this.setCursorPosition();
    }

    setEditorState() {
        const myExt: Extension = [basicSetup, python(), this.customTheme, oneDark];

        this.state = EditorState.create({
            doc: '# type your code here\n',
            extensions: myExt,
        });
    }

    setEditorView() {
        const editorElement = this.editor.nativeElement;
        const state = this.state;
        this.view = new EditorView({
            state,
            parent: editorElement,
        });
    }

    setTheme() {
        this.customTheme = EditorView.theme(
            {
                '&': {
                    backgroundColor: 'var(--surface-section)',
                },
                '.cm-gutters': {
                    backgroundColor: 'var(--surface-section)',
                },
            },
            { dark: true },
        );
    }

    setCursorPosition() {
        // set new cursor position
        const cursorPosition = this.state.doc.line(2).from;

        this.view.dispatch({
            selection: {
                anchor: cursorPosition,
                head: cursorPosition,
            },
        });

        this.view.focus();
    }
}
