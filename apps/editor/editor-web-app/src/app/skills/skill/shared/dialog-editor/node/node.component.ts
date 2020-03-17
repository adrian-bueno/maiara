import {
    Component, Input, Output, EventEmitter, AfterViewInit,
    ChangeDetectorRef, ChangeDetectionStrategy, ElementRef, ViewChild
} from '@angular/core';
import { CdkDragStart, CdkDragMove, CdkDragEnd } from '@angular/cdk/drag-drop';

import { DialogNode, DialogPoint } from '../../models/dialog';


export enum PortType { Input = "Input", Output = "Output" }

export interface NodePortEventData {
    portType: PortType;
    conditionIndex?: number;
    position: DialogPoint;
}

@Component({
    selector: 'node',
    templateUrl: './node.component.html',
    styleUrls: ['./node.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeComponent implements AfterViewInit {

    @Input() node: DialogNode;

    @ViewChild("nodeElem", { static: false }) nodeElem: ElementRef;

    @Output() onMoveStart = new EventEmitter<void>();
    @Output() onMove = new EventEmitter<DialogPoint>(); // Emits the distance variation
    @Output() onMoveEnd = new EventEmitter<void>();
    @Output() newEdgeStart = new EventEmitter<NodePortEventData>();
    @Output() newEdgeMoving = new EventEmitter<NodePortEventData>();
    @Output() newEdgeEnd = new EventEmitter<NodePortEventData>();

    isDragDisabled: boolean = false;

    previousClientRect: ClientRect;


    constructor(private cdRef: ChangeDetectorRef) {

    }

    ngAfterViewInit() {
        this.previousClientRect = this.nodeElem.nativeElement.getBoundingClientRect();
    }

    getXpx(): string {
        if (!this.node.position || !this.node.position.x)
            return "0";
        return this.node.position.x + "px";
    }
    getYpx(): string {
        if (!this.node.position || !this.node.position.y)
            return "0";
        return this.node.position.y + "px";
    }

    onCdkDragStart(_event: CdkDragStart) {
        this.onMoveStart.emit();
    }

    onCdkDragMoved(_event: CdkDragMove<any>) {
        const diff = this.getNodePositionDifference(this.previousClientRect, this.nodeElem.nativeElement.getBoundingClientRect());
        this.previousClientRect = this.nodeElem.nativeElement.getBoundingClientRect();
        this.onMove.emit(diff);
    }

    onCdkDragEnded(_event: CdkDragEnd) {
        this.onMoveEnd.emit();
    }

    onPortTap(event: Event, portType: string, index: number) {
        this.isDragDisabled = false;
        this.cdRef.detectChanges();
    }

    onPortMousePanStart(event: any, portType: string, index: number) {
        this.isDragDisabled = true;
        this.cdRef.detectChanges();
        let elem: HTMLElement = event.target || event.srcElement;
        let pos = elem.getBoundingClientRect();
        this.newEdgeStart.emit({
            portType: portType as PortType,
            conditionIndex: index,
            position: {
                x: pos.left + elem.clientWidth / 2,
                y: pos.top + elem.clientHeight / 2
            }
        });
    }

    onPortTouchStart(event: any, portType: string, index: number) {
        this.isDragDisabled = true;
        this.cdRef.detectChanges();
        let elem: HTMLElement = event.target || event.srcElement;
        let pos = elem.getBoundingClientRect();
        this.newEdgeStart.emit({
            portType: portType as PortType,
            conditionIndex: index,
            position: {
                x: pos.left + elem.clientWidth / 2,
                y: pos.top + elem.clientHeight / 2
            }
        });
    }

    onPortTouchEnd(event: any, portType: string, index: number) {

        // If the touchend event finish in another node port then
        // force the other node port dispatch a touchend event
        const changedTouch = event.changedTouches[0];
        const elems = document.elementsFromPoint(changedTouch.clientX, changedTouch.clientY);
        for (const elem of elems) {
            if (elem.nodeName === "svg") {
                const className:any = elem.className;
                if (className && className.baseVal && className.baseVal.startsWith("port")) {
                    elem.dispatchEvent(new Event("forcedtouchend"));
                    break;
                }
            }
        }

        // Throw event for this element port
        let elem: HTMLElement = event.target || event.srcElement;
        let pos = elem.getBoundingClientRect();
        this.newEdgeEnd.emit({
            portType: portType as PortType,
            conditionIndex: index,
            position: {
                x: pos.left + elem.clientWidth / 2,
                y: pos.top + elem.clientHeight / 2
            }
        });


        this.isDragDisabled = false;
        this.cdRef.detectChanges();
    }

    onForcedTouchEndEvent(event: any, portType: string, index: number) {
        let elem: HTMLElement = event.target || event.srcElement;
        let pos = elem.getBoundingClientRect();
        this.newEdgeEnd.emit({
            portType: portType as PortType,
            conditionIndex: index,
            position: {
                x: pos.left + elem.clientWidth / 2,
                y: pos.top + elem.clientHeight / 2
            }
        });
    }

    onPortPanMove(event: any, portType: string, index: number) {
        this.newEdgeMoving.emit({
            portType: portType as PortType,
            conditionIndex: index,
            position: {
                x: event.center.x,
                y: event.center.y
            }
        });
    }

    onPortPanEnd(event: any, portType: string, index: number) {
        this.isDragDisabled = false;
        this.cdRef.detectChanges();
        this.newEdgeEnd.emit({
            portType: portType as PortType,
            conditionIndex: index,
            position: {
                x: event.center.x,
                y: event.center.y
            }
        });
    }

    onPortMouseUp(event: any, portType: string, index: number) {
        let elem: HTMLElement = event.target || event.srcElement;
        let pos = elem.getBoundingClientRect();
        this.newEdgeEnd.emit({
            portType: portType as PortType,
            conditionIndex: index,
            position: {
                x: pos.left + elem.clientWidth / 2,
                y: pos.top + elem.clientHeight / 2
            }
        });
    }

    private getNodePositionDifference(previous: ClientRect, current: ClientRect): DialogPoint {
        return {
            x: current.left - previous.left,
            y: current.top - previous.top
        }
    }

}
