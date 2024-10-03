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

    constructor(@Inject(DOCUMENT) private document: Document) {}

    ngAfterViewInit() {
        const customTheme = EditorView.theme(
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

        const editorElement = this.editor.nativeElement;
        const myExt: Extension = [basicSetup, python(), customTheme, oneDark];
        let state!: EditorState;

        try {
            state = EditorState.create({
                doc: '# type your code here',
                extensions: myExt,
            });
        } catch (e) {
            console.log(e);
        }

        //console.log(state);

        new EditorView({
            state,
            parent: editorElement,
        });
    }
}
