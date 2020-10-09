import * as azmaps from 'azure-maps-control';

declare namespace atlas {
    
    /** A control that allows swiping between two overlapping maps, ideal for comparing two overlapping data sets. */
    export class SwipeMap {
        /**
         * A control that allows swiping between two overlapping maps. 
         * @param primaryMap The left or top map to swipe between.
         * @param secondaryMap The right or bottom map to swipe between. 
         * @param options The options for the control. 
         */
        constructor(primaryMap: azmaps.Map, secondaryMap: azmaps.Map, options: SwipeMapOptions);

        /****************************
         * Public Methods
         ***************************/

        /** Dispose the swipe map control and clean up its resources. */
        public dispose(): void;

        /** Gets the options of the swipe map control. */
        public getOptions(): SwipeMapOptions;

        /**
         * Sets the options of the control.
         * @param options The options to update.
         */
        public setOptions(options: SwipeMapOptions): void;
    }
  
    /** Options for the swipe map control. */
    export interface SwipeMapOptions {

        /** The position of the slider in pixels relative to the left or top edge of the viewport, depending on orientation. Defaults to half the width or height depending on orientation. */
        sliderPosition?: number;

        /** Specifies if the slider can be moved using mouse, touch or keyboard. Default: true */
        interactive?: boolean;

        /** The style of the control. Can be; light, dark, or any CSS3 color. Overridden if device is in high contrast mode. Default `light' */
        style?: 'ligh' | 'dark' | string;

        /** The orientation of the swipe map control. Can be 'vertical' or 'horizontal'. Default: 'vertical' */
        orientation?: 'vertical' | 'horizontal'; 
    }
}

/**
 * This module partially defines the map control.
 * This definition only includes the features added by using the drawing tools.
 * For the base definition see:
 * https://docs.microsoft.com/javascript/api/azure-maps-control/?view=azure-maps-typescript-latest
 */
declare module "azure-maps-control" {
    /**
     * This interface partially defines the map control's `EventManager`.
     * This definition only includes the method added by using the drawing tools.
     * For the base definition see:
     * https://docs.microsoft.com/javascript/api/azure-maps-control/atlas.eventmanager?view=azure-maps-typescript-latest
     */
    export interface EventManager {
        /**
         * Adds an event to the `SwipeMap`.
         * @param eventType The event name.
         * @param target The `SwipeMap` to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "positionChanged", target: atlas.SwipeMap, callback: (e: number) => void): void;

        /**
         * Adds an event to the `SwipeMap` once.
         * @param eventType The event name.
         * @param target The `SwipeMap` to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "positionChanged", target: atlas.SwipeMap, callback: (e: number) => void): void;

 
        /**
         * Removes an event listener from the `SwipeMap`.
         * @param eventType The event name.
         * @param target The `SwipeMap` to remove the event for.
         * @param callback The event handler callback.
         */
        remove(eventType: string, target: atlas.SwipeMap, callback: (e: number) => void): void;
    }
}

export = atlas;