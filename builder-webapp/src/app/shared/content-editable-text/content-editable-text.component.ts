import {
    Component, ChangeDetectionStrategy, Input, OnChanges, OnInit,
    SimpleChanges, ElementRef, ViewChild, Output, EventEmitter, HostListener
} from '@angular/core';


export interface TextSelection {
    text: string;
    start: number;
    end: number;
}

@Component({
    selector: 'content-editable-text',
    templateUrl: './content-editable-text.component.html',
    styleUrls: ['./content-editable-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentEditableTextComponent implements OnInit, OnChanges {

    @Input() trimOnBlur: boolean = false;
    @Input() selectWords: boolean = true;
    @Input() removeSelection: boolean = false;
    @Input() wrapWords: boolean = false;
    @Input() regexInvalid: string;
    @Input() text: string;
    @Output() textChange = new EventEmitter<string>();
    @Output() onBlur = new EventEmitter<string>();
    @Output() textSelected = new EventEmitter<TextSelection>();

    editText: string;
    viewText: string;
    isFocused: boolean = false;
    badText: boolean = false;

    @ViewChild("elem", { static: false }) elem: ElementRef;


    ngOnInit() {
        this.editText = this.text;
        this.viewText = this.text;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.isFocused) {
            this.editText = changes.text.currentValue;
            this.viewText = this.editText;
        }
    }

    onBlurHandler() {
        this.text = this.editText;

        if (this.editText && this.trimOnBlur) {
            this.editText = this.editText.trim();
            this.elem.nativeElement.textContent = this.editText;

            this.badText = !this.isTextValid(this.editText);

            if (this.editText !== this.text && !this.badText) {
                this.text = this.editText;
                this.textChange.emit(this.text);
            }
        }

        this.isFocused = false;
        this.onBlur.emit(this.text);
    }

    onFocusHandler() {
        this.isFocused = true;
    }

    onEnter($event: any) {
        $event.preventDefault();
    }

    onContentChange($event: any) {
        this.editText = $event.srcElement.textContent;
        this.badText = !this.isTextValid(this.editText);
        if (!this.badText) {
            this.text = this.editText;
            this.textChange.emit(this.text);
        }
    }

    private isTextValid(text: string): boolean {
        if (this.regexInvalid && text) {
            const r = new RegExp(this.regexInvalid, "g");
            return !r.test(text);
        }
        return true;
    }

    getFullSelection(fullText: string, rangeStart: number, rangeEnd: number): TextSelection {
        let start: number = rangeStart-1;
        let end: number = rangeEnd-1;

        if (start < 0) start = 0;
        if (end > fullText.length) end = fullText.length;

        // Remove not alphanumeric at start
        while(start < end && fullText[start].match(/\W/)) {
            start++;
        }
        // Remove not alphanumeric at end
        while(start < (end - 1) && fullText[end - 1].match(/\W/)) {
            end--;
        }
        // Expand start until non alphanumeric
        while ((start - 1 >= 0) && fullText[start - 1].match(/\w/)) {
            start--;
        }
        // Expand end until non alphanumeric
        while ((end < fullText.length) && fullText[end].match(/\w/)) {
            end++;
        }

        let text = fullText.substring(start, end);

        return { text, start, end };
    }

    onTouchEnd() {
        this.processTextSelection();
    }

    @HostListener("document:mouseup", ["$event"])
    onDocumentMouseUp() {
        this.processTextSelection();
    }

    processTextSelection() {
        const selection: Selection = window.getSelection();

        if (!this.elem.nativeElement.contains(selection.focusNode) ||
            !window.getSelection().toString().trim()) {
                return;
        }

        const range: Range = selection.getRangeAt(0);

        let textSelection: TextSelection;
        if (this.selectWords) {
            textSelection = this.getFullSelection(this.editText, range.startOffset, range.endOffset);
        } else {
            textSelection = {
                text: window.getSelection().toString(),
                start: range.startOffset,
                end: range.endOffset
            };
        }
        if (this.removeSelection) {
            selection.removeAllRanges();
        }
        this.textSelected.emit(textSelection);
    }

    // focusInput() {
    //     if (!this.isFocused &&
    //         this.elem.nativeElement.focus) {
    //         this.elem.nativeElement.focus();
    //
    //         if (typeof window.getSelection != "undefined"
    //         && typeof document.createRange != "undefined") {
    //             var range = document.createRange();
    //             range.selectNodeContents(this.elem.nativeElement);
    //             range.collapse(false);
    //             var sel = window.getSelection();
    //             sel.removeAllRanges();
    //             sel.addRange(range);
    //         }
    //     }
    // }

}
