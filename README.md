---
page_type: sample
description: A module for the Azure Maps Web SDK that allows swiping between two overlapping maps, ideal for comparing two overlapping data sets.
languages:
- javascript
- typescript
products:
- azure
- azure-maps
---

# Azure Maps Swipe Map module

A module for the Azure Maps Web SDK that allows swiping between two overlapping maps, ideal for comparing two overlapping data sets.

**Samples**

[Swipe between two maps](https://samples.azuremaps.com/?sample=swipe-between-two-maps)
<br/>[<img src="https://samples.azuremaps.com/map/swipe-between-two-maps/screenshot.jpg" height="200px">](https://samples.azuremaps.com/?sample=swipe-between-two-maps)

[Swipe map with fullscreen support](https://samples.azuremaps.com/?sample=swipe-map-with-fullscreen-support)
<br/>[<img src="https://samples.azuremaps.com/map/swipe-map-with-fullscreen-support/screenshot.jpg" height="200px">](https://samples.azuremaps.com/?sample=swipe-map-with-fullscreen-support)

[Swipe map module options](https://samples.azuremaps.com/?sample=swipe-map-module-options)
<br/>[<img src="https://samples.azuremaps.com/map/swipe-map-module-options/screenshot.jpg" height="200px">](https://samples.azuremaps.com/?sample=swipe-map-module-options)

## Getting started

Download the project and copy the `azure-maps-swipe-map` JavaScript file from the `dist` folder into your project. 

**Usage**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title></title>

    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="IE=Edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

    <!-- Add references to the Azure Maps Map control JavaScript and CSS files. -->
    <link rel="stylesheet" href="https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.css" type="text/css" />
    <script src="https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.js"></script>

    <!-- Load in the JavaScript for the swipe map module. -->
    <script src="../dist/azure-maps-swipe-map.min.js"></script>

    <script type='text/javascript'>
        var primaryMap, secondaryMap;

        function GetMap() {
		//Add your Azure Maps key to the map SDK. Get an Azure Maps key at https://azure.com/maps. NOTE: The primary key should be used as the key.
		var authOptions = {
			authType: 'subscriptionKey',
			subscriptionKey: '<Your Azure Maps Key>'
		};

		//Initialize a left map instance.
		primaryMap = new atlas.Map('primaryMap', {
			center: [-100, 35],
			zoom: 3,
			style: 'grayscale_dark',
			view: 'Auto',		
			authOptions: authOptions
		});

		primaryMap.events.add('ready', function () {
			//Add some data to the primary map.
		});

			//Initialize a right map instance.
		secondaryMap = new atlas.Map('secondaryMap', {
			style: 'grayscale_dark',
			view: 'Auto',
			authOptions: authOptions
		});

		secondaryMap.events.add('ready', function () {
			//Add some data to the secondary map.
		});

		//Initialize the swipe map experience.
		var swipeMap = new atlas.SwipeMap(primaryMap, secondaryMap);

		//Optionally monitor the positionChanged event of the swipeMap. This event can be attached to either map.
		primaryMap.events.add('positionChanged', swipeMap, function (x) {
			//Do something
		});
        }
    </script>
    <style>
	html, body {
		width: 100%;
		height: 100%;
		padding: 0;
		margin: 0;
	}
	
        .mapContainer {
            position: relative;
            width: 100%;
            height: 100%;
        }
	    
        .map {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body onload="GetMap()">
    <div class="mapContainer">
        <div id="primaryMap" class="map"></div>
        <div id="secondaryMap" class="map"></div>
    </div>
</body>
</html>
```

## API Reference

### SwipeMap class

Namespace: `atlas`

A control that allows swiping between two overlapping maps, ideal for comparing two overlapping data sets.

**Contstructor**

> `SwipeMap(primaryMap: atlas.Map, secondaryMap: atlas.Map, options?: SwipeMapOptions)`

**Methods** 

| Name | Return type | Description |
|------|-------------|-------------|
| `dispose()` | | Doisposes the control. |
| `getOptions()` | `SwipeMapOption` | Gets the options of the control. |
| `setOptions(options: SwipeMapOption)` | | Sets the options of the control. |

**Events**

| Name | Return type | Description |
|------|-------------|-------------|
| `positionChanged` | `number` | Event fired when the  slider position has changed. returns the slider position value in pixels. This event can be attached to either map. |

### SwipeMapOption interface

Options for the `SwipeMap` class.

**Properties** 

| Name | Type | Description |
|------|------|-------------|
| `interactive` | `boolean` | Specifies if the slider can be moved using mouse, touch or keyboard. Default: `true` |
| `orientation` | `'vertical'` \| `'horizontal'` | The orientation of the swipe map control. Can be `vertical` or `horizontal`. Default: `vertical` |
| `sliderPosition` | `number` | The position of the slider in pixels relative to the left or top edge of the viewport, depending on orientation. Defaults to half the width or height depending on orientation. |
| `style` | `'light` \| `'dark'` \| `string` | The style of the control. Can be; `light`, `dark`, `auto`, or any CSS3 color. Overridden if device is in high contrast mode. Default `light`. |

## Related Projects

* [Azure Maps Web SDK Open modules](https://github.com/microsoft/Maps/blob/master/AzureMaps.md#open-web-sdk-modules) - A collection of open source modules that extend the Azure Maps Web SDK.
* [Azure Maps Web SDK Samples](https://github.com/Azure-Samples/AzureMapsCodeSamples)
* [Azure Maps Gov Cloud Web SDK Samples](https://github.com/Azure-Samples/AzureMapsGovCloudCodeSamples)
* [Azure Maps & Azure Active Directory Samples](https://github.com/Azure-Samples/Azure-Maps-AzureAD-Samples)
* [List of open-source Azure Maps projects](https://github.com/microsoft/Maps/blob/master/AzureMaps.md)

## Additional Resources

* [Azure Maps (main site)](https://azure.com/maps)
* [Azure Maps Documentation](https://docs.microsoft.com/azure/azure-maps/index)
* [Azure Maps Blog](https://azure.microsoft.com/blog/topics/azure-maps/)
* [Microsoft Q&A](https://docs.microsoft.com/answers/topics/azure-maps.html)
* [Azure Maps feedback](https://feedback.azure.com/forums/909172-azure-maps)

## Contributing

We welcome contributions. Feel free to submit code samples, file issues and pull requests on the repo and we'll address them as we can. 
Learn more about how you can help on our [Contribution Rules & Guidelines](https://github.com/Azure-Samples/azure-maps-swipe-map/blob/master/CONTRIBUTING.md). 

You can reach out to us anytime with questions and suggestions using our communities below:
* [Microsoft Q&A](https://docs.microsoft.com/answers/topics/azure-maps.html)
* [Azure Maps feedback](https://feedback.azure.com/forums/909172-azure-maps)

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). 
For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or 
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

MIT
 
See [License](https://github.com/Azure-Samples/azure-maps-swipe-map/blob/master/LICENSE.md) for full license text.
