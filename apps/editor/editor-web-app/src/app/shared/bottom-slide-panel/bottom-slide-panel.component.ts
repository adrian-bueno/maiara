import {
    Component, ChangeDetectionStrategy, Input, OnChanges,
    SimpleChanges, HostListener, ElementRef, EventEmitter, Output
} from '@angular/core';


@Component({
    selector: 'bottom-slide-panel',
    templateUrl: './bottom-slide-panel.component.html',
    styleUrls: ['./bottom-slide-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BottomSlidePanelComponent implements OnChanges {

    @Input() closeOnClickOut: boolean = false;
    @Input() isFullScreen: boolean = false;
    @Input() isOpen: boolean = false;
    @Output() isOpenChange = new EventEmitter<boolean>();

    activeClases: string;
    private disableClickOut: boolean = false;

    constructor(private elemRef: ElementRef) {

    }

    @HostListener("document:click", ["$event"])
    onClickOut($event: MouseEvent) {
        if (!this.disableClickOut && this.closeOnClickOut && this.isOpen) {
            if (!this.elemRef.nativeElement.contains($event.target)) {
                this.isOpen = false;
                this.isOpenChange.emit(this.isOpen);
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.disableClickOut = true;
        const firstChange = changes.isOpen.firstChange;
        const isOpen = changes.isOpen.currentValue;
        const isFullScreen = changes.isFullScreen ? changes.isFullScreen.currentValue : this.isFullScreen;
        this.updateClasses(firstChange, isOpen, isFullScreen);
        setTimeout(() => this.disableClickOut = false, 300);
    }

    private updateClasses(firstChange: boolean, isOpen: boolean, isFullScreen: boolean) {
        if (firstChange && isOpen)
            this.activeClases = "is-open";
        else if (firstChange && !isOpen)
            this.activeClases = "is-closed";
        else if (!firstChange && isOpen)
            this.activeClases = "open";
        else
            this.activeClases = "close";

        if (isFullScreen)
            this.activeClases += " is-full-screen";
    }

}
