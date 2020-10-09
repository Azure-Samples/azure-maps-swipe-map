import { SwipeMap, SwipeMapEvents } from '../control';

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
        add(eventType: "positionChanged", target: SwipeMap, callback: (e: number) => void): void;

        /**
         * Adds an event to the `SwipeMap` once.
         * @param eventType The event name.
         * @param target The `SwipeMap` to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "positionChanged", target: SwipeMap, callback: (e: number) => void): void;

 
        /**
         * Removes an event listener from the `SwipeMap`.
         * @param eventType The event name.
         * @param target The `SwipeMap` to remove the event for.
         * @param callback The event handler callback.
         */
        remove(eventType: string, target: SwipeMap, callback: (e: number) => void): void;
    }
}