import * as azmaps from 'azure-maps-control';

/** The events supported by the `SwipeMap` control. */
export interface SwipeMapEvents {
    /** Event fired when the  slider position has changed. returns the slider position value in pixels. */
    positionChanged: number;
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

/** A control that allows swiping between two overlapping maps, ideal for comparing two overlapping data sets. */
export class SwipeMap extends azmaps.internal.EventEmitter<SwipeMapEvents> {

    /****************************
     * Private Properties
     ***************************/

    private _container: HTMLElement;
    private _swipeHandle: HTMLElement;
    private _primaryMap: azmaps.Map;
    private _secondaryMap: azmaps.Map;
    private _options: SwipeMapOptions = {
        interactive: true,
        style: 'light',
        orientation: 'vertical'
    };
    private _rightMapClientRect: ClientRect; 
    private _syncEvents: any[] = [];
    private _maps: azmaps.Map[] = [];
    private _markers: azmaps.HtmlMarker[] = [];
    private _canMove = false;
    private _keyRepater: any;
    private _hclStyle:azmaps.ControlStyle;
    private _darkColor = '#011c2c';

    private _css = {
        root: 'azure-maps-swipe-map',
        hor: 'azure-maps-swipe-map-horizontal',
        hHandle: 'azure-maps-swipe-map-handle-horizontal',
        vHandle: 'azure-maps-swipe-map-handle'
    };
    
    /****************************
     * Constructor
     ***************************/

    /**
     * A control that allows swiping between two overlapping maps. 
     * @param primaryMap The left or top map to swipe between.
     * @param secondaryMap The right or bottom map to swipe between. 
     * @param options The options for the control. 
     */
    constructor(primaryMap: azmaps.Map, secondaryMap: azmaps.Map, options?: SwipeMapOptions) {
        super();

        const self = this;
        const opt = self._options;

        self._primaryMap = primaryMap;
        self._secondaryMap = secondaryMap;

        let positionSet = false;

        //Update the options.
        if (options) {
            
            if (typeof options.sliderPosition === 'number') {
                positionSet = true;
            }

            Object.assign(opt, options);
        }

        //If position not set, default the slider position to the middle of the maps.
        if (!positionSet) {
            const rect = self._primaryMap.getMapContainer().getBoundingClientRect();
            if (opt.orientation === 'vertical') {
                opt.sliderPosition = rect.width / 2;
            } else {
                opt.sliderPosition = rect.height / 2;
            }
        }

        //Initialize the control.
        self.init();
    }

    /****************************
     * Public Methods
     ***************************/

    /** Dispose the swipe map control and clean up its resources. */
    public dispose(): void {
        const self = this;

        //Remove event handlers.
        self._swipeHandle.removeEventListener('mousedown', self._mouseDown, false);
        self._swipeHandle.removeEventListener('touchstart', self._touchStart, false);
        self._swipeHandle.removeEventListener('keydown', self._keyDown, false);
        self._swipeHandle.removeEventListener('keyup', self._touchStart, false);
        document.removeEventListener('touchend', self._touchEnd, false);
        document.removeEventListener('mouseup', self._mouseUp, false);
        document.removeEventListener('touchmove', self._mouseMove, false);
        document.removeEventListener('mousemove', self._mouseMove, false);
        self._secondaryMap.events.remove('resize', self._mapResized);

        self._detachMapMoveHandlers();

        self._options = null;

        //Remove swipe map container.
        self._primaryMap.getMapContainer().removeChild(self._container);
        self._container = null;
        self._swipeHandle = null;

        self._secondaryMap = null;
        self._rightMapClientRect = null;

        self._primaryMap = null;
    }

    /** Gets the options of the swipe map control. */
    public getOptions(): SwipeMapOptions {
        return this._options;
    }

    /**
     * Sets the options of the control.
     * @param options The options to update.
     */
    public setOptions(options: SwipeMapOptions): void {
        if (options) {
            
            const self = this;
            const css = self._css;
            const container = self._container;
            const containerClassList = container.classList;
            const opt = self._options;
            const swipeHandle = self._swipeHandle;
            const map = self._primaryMap;

            if (options.orientation !== opt.orientation && (options.orientation === 'vertical' || options.orientation === 'horizontal')) {
                const rect = map.getMapContainer().getBoundingClientRect();

                if (options.orientation === 'horizontal') {
                    container.style.flexDirection = 'row';

                    if (!containerClassList.contains(css.hor)) {
                        containerClassList.add(css.hor);
                        swipeHandle.classList.add(css.hHandle);

                        if (typeof options.sliderPosition === 'undefined') {
                            options.sliderPosition = rect.height / 2;
                        }
                    }
                } else {
                    container.style.flexDirection = 'column';

                    if (containerClassList.contains(css.hor)) {
                        containerClassList.remove(css.hor);
                        swipeHandle.classList.remove(css.hHandle);

                        if (typeof options.sliderPosition === 'undefined') {
                            options.sliderPosition = rect.width / 2;
                        }
                    }
                }

                opt.orientation = options.orientation;
            }

            if (typeof options.sliderPosition === 'number') {
                self._setSliderPosition(options.sliderPosition);
            }

            if (typeof options.interactive === 'boolean') {
                opt.interactive = options.interactive;

                //Hide the swipe handle if not interactive.
                swipeHandle.style.display = (options.interactive) ? '' : 'none';
            }
            
            if(typeof options.style === 'string'){
                let color = options.style;

                if(self._hclStyle) {
                    if(self._hclStyle === 'dark'){
                        color = self._darkColor;
                    }
                } else {
                    opt.style = color;

                    switch (options.style) {
                        case 'dark':
                            color = self._darkColor;
                            break;
                        case 'light':
                            color = 'white';
                            break;
                    }
                }

                container.style.backgroundColor = color;
                swipeHandle.style.backgroundColor = color;
            }
        }
    }

    /****************************
     * Private Methods
     ***************************/

    /** Initialization functionality for the control. */
    private init(): void {
        const self = this;
        const primaryMap = self._primaryMap;
        const secondaryMap = self._secondaryMap;

        if (primaryMap && secondaryMap) {
            const mcl = primaryMap.getMapContainer().classList;
            if(mcl.contains("high-contrast-dark")){
                self._hclStyle = <azmaps.ControlStyle>'dark';
            }  else if (mcl.contains("high-contrast-light")){
                self._hclStyle = <azmaps.ControlStyle>'light';
            }

            const css = self._css;

            //Add css for swipe map control to the DOM.
            const style = document.createElement('style');
            style.innerHTML = ".azure-maps-swipe-map{background-color:#fff;position:absolute;width:2px;height:100%;z-index:1}.azure-maps-swipe-map-handle{display:inline-block;position:absolute;width:32px;height:32px;top:50%;left:-16px;margin:-16px 1px 0;color:#fff;border-radius:50%;background-color:#fff;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAtAgMAAABdSOqHAAAACVBMVEVvAFGZnKGYnKHRdglsAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAAFxEAABcRAcom8z8AAAAHdElNRQfjBBMQJjL8B+zpAAAAIUlEQVQY02NYtYCBaxUD06oGhlHWUGKFBjCwhjIwhjoAAD5WjM7Wpy2IAAAAAElFTkSuQmCC);text-align:center;cursor:pointer;background-repeat:no-repeat;background-size:11px;background-position:center center;z-index:200;box-shadow:0 0 1px 1px rgba(0,0,0,.16)}.azure-maps-swipe-map .azure-maps-swipe-map-handle:focus,.azure-maps-swipe-map .azure-maps-swipe-map-handle:hover{cursor:col-resize;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAtAgMAAABdSOqHAAAACVBMVEVSAMQxrM4xrM5QMZf3AAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAAFxEAABcRAcom8z8AAAAHdElNRQfjBBMQJwQqpkgxAAAAIUlEQVQY02NYtYCBaxUD06oGhlHWUGKFBjCwhjIwhjoAAD5WjM7Wpy2IAAAAAElFTkSuQmCC)}.azure-maps-swipe-map-horizontal{width:100%;height:2px}.azure-maps-swipe-map-handle-horizontal{top:-16px;left:50%;margin:-1px 0 0 -16px;background-size:14px;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAiAgMAAAC2IrjcAAAACVBMVEVhAFmZnKGYnKEqW5yZAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAAFxEAABcRAcom8z8AAAAHdElNRQfjBBMQJyQRyGj5AAAAFUlEQVQY02NYhQAODBRz6AVGXe0AAJYfh/3tnkFuAAAAAElFTkSuQmCC)}.azure-maps-swipe-map .azure-maps-swipe-map-handle-horizontal:focus,.azure-maps-swipe-map .azure-maps-swipe-map-handle-horizontal:hover{cursor:row-resize;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAiAgMAAAC2IrjcAAAACVBMVEVhAP8xrM4xrM7t6ZpIAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAAFxEAABcRAcom8z8AAAAHdElNRQfjBBMQJzbicRmxAAAAFUlEQVQY02NYhQAODBRz6AVGXe0AAJYfh/3tnkFuAAAAAElFTkSuQmCC)}";
            document.body.appendChild(style);

            //Retrieve the arial label for the control. 
            const ariaLabel = SwipeMap._getAriaLabel(primaryMap.getStyle().language);

            //Create a container for the control.
            const container = document.createElement('div');
            container.classList.add(css.root);
            container.setAttribute('aria-label', ariaLabel);
            container.style.flexDirection = 'column';

            self._container = container;            

            //Create a handle for the swipe control.
            const swipeHandle = document.createElement('div');
            swipeHandle.classList.add(css.vHandle);
            swipeHandle.setAttribute('tabindex', '0');
            swipeHandle.setAttribute('title', ariaLabel);
            swipeHandle.setAttribute('alt', ariaLabel);
            this._swipeHandle = swipeHandle;

            if (self._options.orientation === 'horizontal') {
                container.style.flexDirection = 'row';
                container.classList.add(css.hor);
                swipeHandle.classList.add(css.hHandle);
            }

            container.style['msUserSelect'] = 'none';
            container.style.webkitUserSelect = 'none';
            container.style.userSelect = 'none';

            swipeHandle.addEventListener('mousedown', self._mouseDown, false);
            swipeHandle.addEventListener('touchstart', self._touchStart, false);
            swipeHandle.addEventListener('keydown', self._keyDown, false);
            swipeHandle.addEventListener('keyup', self._keyUp, false);
            document.addEventListener('touchend', self._touchEnd, false);
            document.addEventListener('mouseup', self._mouseUp, false);
            document.addEventListener('touchmove', self._mouseMove, false);
            document.addEventListener('mousemove', self._mouseMove, false);

            container.appendChild(swipeHandle);

            primaryMap.getMapContainer().appendChild(container);

            self._rightMapClientRect = secondaryMap.getMapContainer().getBoundingClientRect();

            //If the size of the right map is changed, update the slider position. 
            secondaryMap.events.add('resize', self._mapResized);         

            self._maps = [primaryMap, secondaryMap];

            //Bind sync events and synchronize the map views.
            self._maps.forEach((map, index) => {
                self._syncEvents[index] = self._synchronizeMaps.bind(self, map);
            });

            //Sync all map views with the first map.
            self._syncEvents[0]();

            //Attach the map move handler.
            self._attachMapMoveHandlers();

            //Set the initial options of the control. 
            self.setOptions(self._options);
        }
    }

    /** When the mouse is down, allow moving of the swipe slider, but don't show the accessibility outline.  */
    private _mouseDown = () => {
        this._canMove = true;
        this._swipeHandle.style.outlineWidth = '0';
    };

    /** When mouse up, don't allow moving anymore, and set the accessibility outline for when the handle has focus (i.e. by tabbing to it).*/
    private _mouseUp = () => {
        const self = this;
        self._canMove = false;
        self._swipeHandle.style.outlineWidth = '1px';

        //Lose focus of handle.
        self._swipeHandle.blur();
    };

    /** On touch start, allow moving. */
    private _touchStart = () => {
        this._canMove = true;
    };

    /** On touch end, don't allow moving */
    private _touchEnd = () => {
        this._canMove = false;
    };

    /** When a keyup occurs on the handle, clear the repeater used to animate the slider when arrows keys are held down. */
    private _keyUp = (e: KeyboardEvent) => {
        window.clearInterval(this._keyRepater);
        this._keyRepater = null;
    };

    /** On key down on the swipe handle, let the left and right arrow keys move the slider. */
    private _keyDown = (e: KeyboardEvent) => {
        const self = this;
        const opt = self._options;

        if (self._keyRepater) {
            window.clearInterval(self._keyRepater);
        }

        if (opt.orientation === 'vertical') {
            //If the left or right arrows are pressed, move the slider position. 
            if (e.keyCode === 37 || e.keyCode === 39) {
                //Use an interval to animate the slider position when the arrow keys are held down. 
                self._keyRepater = window.setInterval(() => {
                    self._setSliderPosition(opt.sliderPosition + ((e.keyCode === 37) ? -1 : 1));
                }, 1);
            }
        } else {
            //If the up or down arrows are pressed, move the slider position. 
            if (e.keyCode === 38 || e.keyCode === 40) {
                //Use an interval to animate the slider position when the arrow keys are held down. 
                self._keyRepater = window.setInterval(() => {
                    self._setSliderPosition(opt.sliderPosition + ((e.keyCode === 38) ? -1 : 1));
                }, 1);
            }
        }
    };

    /** When the right map is resized, update the slider position. */
    private _mapResized = () => {  
        const self = this;
        const sliderPosition = self._options.sliderPosition;
        self._rightMapClientRect = self._secondaryMap.getMapContainer().getBoundingClientRect();

        if (typeof sliderPosition == 'number') {
            self._setSliderPosition(sliderPosition);
        }
    };

    /** Attach map move handlers to the maps to synchronize them. */
    private _attachMapMoveHandlers() {
        this._maps.forEach((map, index) => {
            map.events.add('move', this._syncEvents[index]);
        });
    }

    /** Detach map move handlers to the maps. */
    private _detachMapMoveHandlers() {
        this._maps.forEach((map, index) => {
            map.events.remove('move', this._syncEvents[index]);
        });
    }

    /**
     * Synchronize all maps with a base map.
     * @param baseMap The base map to synchronize with. 
     */
    private _synchronizeMaps(baseMap: azmaps.Map) {        
        const self = this;

        const targetMaps = self._maps.filter(function (m, i) { return m !== baseMap; });

        self._detachMapMoveHandlers();
        const cam = baseMap.getCamera();

        targetMaps.forEach(function (targetMap) {
            targetMap.setCamera({
                center: cam.center,
                zoom: cam.zoom,
                bearing: cam.bearing,
                pitch: cam.pitch,
                type: 'jump'
            });
        });
        self._attachMapMoveHandlers();
    }

    /** Mouse move event handler. As the mouse moves, the slider moves with it. */
    private _mouseMove = (e: MouseEvent | TouchEvent) => {
        const self = this;

        self._container.style.pointerEvents = 'auto';
        self._swipeHandle.style.pointerEvents = 'auto';

        if (self._canMove && self._options.interactive) {
            let x = 0;

            if (self._options.orientation === 'vertical') {
                if ((<TouchEvent>e).touches) {
                    x = (<TouchEvent>e).touches[0].clientX;
                } else {
                    x = (<MouseEvent>e).clientX;
                }

                x -= self._rightMapClientRect.left;
            } else {
                if ((<TouchEvent>e).touches) {
                    x = (<TouchEvent>e).touches[0].clientY;
                } else {
                    x = (<MouseEvent>e).clientY;
                }

                x -= self._rightMapClientRect.top;
            }

            self._setSliderPosition(x);
        }
    };

    /**
     * Sets the swipe slider position.
     * @param x The position to set the slider position to. 
     */
    private _setSliderPosition(x: number): void {
        const self = this;
        const opt = self._options;
        const rightMapClientRect = self._rightMapClientRect;
        const secondaryMapStyle = self._secondaryMap.getMapContainer().style;
        const containerStyle = self._container.style;
        let transform: string;

        if (opt.orientation === 'vertical') {
            x = Math.max(Math.min(x, rightMapClientRect.width), 0);
            transform = `translate(${x}px, 0)`;
            secondaryMapStyle.clip = `rect(0, 999em, ${rightMapClientRect.height}px, ${x}px)`;
        } else {
            x = Math.max(Math.min(x, rightMapClientRect.height), 0);
            transform = `translate(0, ${x}px)`;
            secondaryMapStyle.clip = `rect(${x}px, 999em, 999em, 0)`;
        }

        containerStyle.transform = transform;
        containerStyle.webkitTransform = transform;
        opt.sliderPosition = x;

        self._invokeEvent('positionChanged', x);
    }

    /** Translated resources. */
    private static _resx = {
        en: 'Drag to see underlying data',
        af: 'Sleep sien onderliggende data',
        ar: 'اسحب لرؤية البيانات الاساسيه',
        eu: 'Arrastatu azpiko datuak ikusteko',
        bg: 'Плъзнете, за да видите основните данни',
        zh: '拖动以查看基础数据',
        hr: 'Vucite da biste vidjeli temeljne podatke',
        cs: 'Přetažením zobrazíte podkladová data.',
        da: 'Træk for at se underliggende data',
        nl: 'Slepen om onderliggende gegevens weer te geven',
        et: 'Alusandmete nägemiseks lohistage',
        fi: 'Näytä pohjana olevat tiedot vetämällä',
        fr: 'Faites glisser pour voir les données sous-jacentes',
        gl: 'Arrastre para ver os datos subxacentes',
        de: 'Ziehen Sie, um die zugrunde liegenden Daten zu sehen',
        el: 'Σύρετε για να δείτε τα υποκείμενα δεδομένα',
        hi: 'अंतर्निहित डेटा देखने के लिए खींचें',
        hu: 'Húzással láthatja az alapul szolgáló adatokat',
        id: 'Seret untuk melihat data yang mendasari',
        it: 'Trascinare per visualizzare i dati sottostanti',
        ja: 'ドラッグして基になるデータを表示',
        kk: 'Негізгі деректерді көру үшін сүйреңіз',
        ko: '기본 데이터를 보려면 끕니다.',
        es: 'Arrastre para ver los datos subyacentes',
        lv: 'Velciet, lai skatītu pamatā esošos datus',
        lt: 'Vilkite, kad pamatytumėte pagrindinius duomenis',
        ms: 'Seret untuk melihat data asas',
        nb: 'Dra for å se underliggende data',
        pl: 'Przeciągnij, aby wyświetlić dane bazowe',
        pt: 'Arraste para ver os dados subjacentes',
        ro: 'Glisați pentru a vedea datele subiacente',
        ru: 'Перетаскивание для просмотра базовых данных',
        sr: 'Prevucite da biste videli osnovne podatke',
        sk: 'Presunutím zobrazíte základné údaje',
        sl: 'Povlecite za prikaz osnovnih podatkov',
        sv: 'Dra för att Visa underliggande data',
        th: 'ลากเพื่อดูข้อมูลพื้นฐาน',
        tr: 'Alttaki verileri görmek için sürükleyin',
        uk: 'Перетягніть, щоб переглянути основні дані',
        vi: 'Kéo để xem dữ liệu cơ bản'
    };

    /**
    * Returns the aria label for the control for a given language.
    * @param lang The language code to retrieve the aria label for.
    * @returns The aria label for the control in the specified language.
    */
    private static _getAriaLabel(lang?: string): string {
        if (lang && lang.indexOf('-') > 0) {
            lang = lang.substring(0, lang.indexOf('-'));
        }

        const resx = SwipeMap._resx[lang.toLowerCase()];

        if(!resx){
            return SwipeMap._resx.en;
        }
        
        return resx;
    }
}
