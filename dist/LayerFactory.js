define(["require", "exports", "esri/layers/TileLayer", "esri/layers/GraphicsLayer", "esri/layers/MapImageLayer", "esri/layers/FeatureLayer", "esri/layers/GeoJSONLayer", "./layers/WMTSLayer", "./layers/DynamicLayer", "dojo/_base/url", "esri/config", "./proxyUtils", "./utils", "esri/Basemap", "esri/Graphic", "esri/geometry/support/webMercatorUtils"], function (require, exports, TileLayer_1, GraphicsLayer_1, MapImageLayer_1, FeatureLayer_1, GeoJSONLayer_1, WMTSLayer_1, DynamicLayer_1, url_1, config_1, proxyUtils_1, utils_1, Basemap_1, Graphic_1, webMercatorUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.subDomains = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'];
    var layerMap = {
        tiled: TileLayer_1.default,
        graphics: GraphicsLayer_1.default,
        image: MapImageLayer_1.default,
        feature: FeatureLayer_1.default,
        geojson: GeoJSONLayer_1.default
    };
    var defaultFillSymbol = {
        type: 'simple-fill',
        color: [255, 255, 255, 0.6],
        outline: {
            color: [255, 0, 0],
            width: 2
        }
    };
    function createLayer(layerInfo) {
        var classKey = config_1.default.mapType === '2D'
            ? layerInfo.type
            : config_1.default.mapType + layerInfo.type;
        var keyProperties = ['url', 'title', 'visible', 'useProxy'];
        var option = {};
        for (var p in layerInfo) {
            if (keyProperties.indexOf(p) !== -1) {
                option[p] = layerInfo[p];
            }
        }
        var layer = null;
        if (layerMap[classKey]) {
            layer = new layerMap[classKey](option);
        }
        else if (layerInfo.type === 'wmts') {
            var needAddProxy = true;
            if (typeof layerInfo.useProxy !== 'undefined') {
                needAddProxy = layerInfo.useProxy;
            }
            if (needAddProxy) {
                proxyUtils_1.default.addProxyRule(layerInfo);
            }
            layer = this.createWMTSLayer(layerInfo);
        }
        else {
            console.error('加载图层出错，未定义该类型图层', layerInfo);
            return null;
        }
        layer.id = layerInfo.id || layerInfo.title;
        layer.title = layerInfo.title;
        if (typeof layerInfo.visible === 'boolean') {
            layer.visible = layerInfo.visible;
        }
        return layer;
    }
    exports.createLayer = createLayer;
    function createBaseLayer(layerInfo, fn) {
        if (layerInfo.length > 0) {
            var me_1 = this;
            var baseLayers_1 = [];
            utils_1.default.visitConf(layerInfo, function (layerInfo) {
                var baseLayer = me_1.createLayer(layerInfo);
                baseLayer
                    .load()
                    .then(function (res) {
                    if (fn) {
                        if (res.message) {
                            fn(res.message);
                        }
                    }
                })
                    .catch(function (error) {
                    if (fn) {
                        fn(error.message);
                    }
                });
                baseLayers_1.push(baseLayer);
            });
            var baseMap = new Basemap_1.default({
                baseLayers: baseLayers_1
            });
            baseMap.title = layerInfo[0].title;
            return baseMap;
        }
    }
    exports.createBaseLayer = createBaseLayer;
    function getBaseMaps(layerInfo) {
        var me = this;
        var baseMaps = [];
        utils_1.default.visitConf(layerInfo, function (layerInfo) {
            var baseMap = me.createBaseLayer(layerInfo);
            baseMaps.push(baseMap);
        });
        return baseMaps;
    }
    exports.getBaseMaps = getBaseMaps;
    function createUrlTemplate(option) {
        var urlTemplate;
        if (option.url) {
            urlTemplate = createESRIWMTSUrlTemplate(option.url);
            if (!urlTemplate) {
                var myUrl = option.url;
                if (myUrl.indexOf('/wmts') === -1) {
                    myUrl += '/wmts';
                }
                var tempUrl = new url_1.default(myUrl);
                var splits = tempUrl.path.split('/');
                var layer = splits[splits.length - 2];
                urlTemplate =
                    myUrl +
                        '?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=' +
                        layer +
                        '&STYLE=' +
                        layer +
                        '&FORMAT=image/tile&TILEMATRIXSET=Matrix_0&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}';
            }
        }
        else {
            urlTemplate =
                'http://{subDomain}.tianditu.gov.cn/DataServer?T=' +
                    option.layer +
                    '&x={col}&y={row}&l={level}&tk=' +
                    (option.key || 'fb1bfb9e06cd7681813a42f4c934e1ea');
            return urlTemplate;
        }
    }
    exports.createUrlTemplate = createUrlTemplate;
    function createESRIWMTSUrlTemplate(url) {
        var index0 = url.indexOf('services');
        var index1 = url.indexOf('MapServer');
        if (index0 > -1 && index1 > -1) {
            var tempStr = url.substring(index0 + 9, index1 - 1).replace(/\//g, '_');
            var urlTemplate = url +
                '/WMTS?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=' +
                tempStr +
                '&STYLE=default&FORMAT=image/png&TILEMATRIXSET=default028mm&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}';
            return urlTemplate;
        }
        return null;
    }
    exports.createESRIWMTSUrlTemplate = createESRIWMTSUrlTemplate;
    function createWMTSLayer(option) {
        var myWMTSLayer = new WMTSLayer_1.default(option.url
            ? {
                urlTemplate: createUrlTemplate(option),
                tileInfo: config_1.default.appConfig.epsg.tileInfo
            }
            : {
                urlTemplate: createUrlTemplate(option),
                subDomains: exports.subDomains,
                tileInfo: config_1.default.appConfig.epsg.tileInfo
            });
        myWMTSLayer.id = option.id || option.title;
        myWMTSLayer.title = option.title;
        myWMTSLayer.visible = option.visible;
        return myWMTSLayer;
    }
    exports.createWMTSLayer = createWMTSLayer;
    function createDynamicLayer(option) {
        if (option.url) {
            var dynamicLayer = new DynamicLayer_1.default({
                urlTemplate: option.url,
                tileInfo: config_1.default.appConfig.epsg.tileInfo
            });
            dynamicLayer.title = option.title;
            dynamicLayer.id = 'DynamicLayer';
            return dynamicLayer;
        }
    }
    exports.createDynamicLayer = createDynamicLayer;
    function createDynamicLayer2(params, name) {
        var dynamicLayer = new MapImageLayer_1.default(params);
        dynamicLayer.id = 'DynamicLayer';
        dynamicLayer.title = name;
        return dynamicLayer;
    }
    exports.createDynamicLayer2 = createDynamicLayer2;
    function createMaskLayer(maskInfo) {
        var outerRing = [
            [
                [-180, 90],
                [180, 90],
                [180, -90],
                [-180, -90]
            ]
        ];
        // rings = [...outerRing, ...maskInfo.points] || outerRing
        rings =
            JSON.parse(JSON.stringify(outerRing)).concat(maskInfo.points[0]) ||
                outerRing;
        var mask = {
            type: 'polygon',
            rings: rings
        };
        var maskGraphic = new Graphic_1.default({
            geometry: mask,
            symbol: maskInfo.symbol || defaultFillSymbol
        });
        var maskLayer = new GraphicsLayer_1.default({ graphics: [maskGraphic] });
        maskLayer.id = 'MASKLAYER';
        maskLayer.title = maskLayer.id;
        return maskLayer;
    }
    exports.createMaskLayer = createMaskLayer;
    function createGraphicLayer(features, needTransform, colors) {
        if (!features)
            return;
        var gs = [];
        var graphicLayer;
        features.forEach(function (feature, index) {
            var rings;
            if (needTransform) {
                rings = webMercatorUtils_1.default.webMercatorToGeographic(feature.geometry).rings;
            }
            else {
                rings = feature.geometry.rings || feature.geometry.coordinates;
            }
            var g = new Graphic_1.default({
                geometry: {
                    type: 'polygon',
                    rings: rings
                },
                attributes: feature.attributes,
                symbol: {
                    type: 'simple-fill',
                    color: colors[feature.attributes.Color_ID * 1 - 1],
                    outline: {
                        color: [0, 0, 0],
                        width: 0.5
                    }
                }
            });
            gs.push(g);
            if (index === features.length - 1) {
                graphicLayer = new GraphicsLayer_1.default({
                    graphics: gs
                });
            }
        });
        return graphicLayer;
    }
    exports.createGraphicLayer = createGraphicLayer;
    function showAllFeatures(mapApp, features) {
        if (!mapApp || !features)
            return;
        var graphics = [];
        var symbol = {
            type: 'simple-fill',
            color: [255, 255, 255, 0],
            style: 'none',
            outline: {
                color: [255, 255, 255],
                width: 1
            }
        };
        // 移除上次选择图层（若存在）
        if (mapApp.findLayerById('SGLayer')) {
            mapApp.removeLayerById('SGLayer');
        }
        if (features.length > 0) {
            features.forEach(function (feature) {
                var rings = feature.geometry.rings || feature.geometry.coordinates;
                rings.forEach(function (ring) {
                    var g = new Graphic_1.default({
                        geometry: {
                            type: feature.geometry.type.toLowerCase(),
                            rings: ring
                        },
                        attributes: feature.attributes || feature.properties,
                        symbol: symbol
                    });
                    graphics.push(g);
                });
            });
            var renderGraphicLayer = new GraphicsLayer_1.default({
                graphics: graphics,
                listMode: 'hide'
            });
            renderGraphicLayer.id = 'SGLayer';
            mapApp.map.add(renderGraphicLayer); // 数据量过大无法完全展示
        }
    }
    exports.showAllFeatures = showAllFeatures;
    function showSelectedFeature(mapApp, feature) {
        if (!mapApp || !feature)
            return;
        var graphics = [];
        var symbol = {
            type: 'simple-fill',
            color: [0, 255, 255, 0.7],
            style: 'none',
            outline: {
                color: [0, 255, 255],
                width: 2
            }
        };
        var rings = feature.geometry.rings || feature.geometry.coordinates;
        rings.forEach(function (ring) {
            var g = new Graphic_1.default({
                geometry: {
                    type: feature.geometry.type.toLowerCase(),
                    rings: ring
                },
                attributes: feature.attributes || feature.properties,
                symbol: symbol
            });
            graphics.push(g);
        });
        // 移除上次选择图层（若存在）
        if (mapApp.findLayerById('RGLayer')) {
            mapApp.removeLayerById('RGLayer');
        }
        var renderGraphicLayer = new GraphicsLayer_1.default({
            graphics: graphics,
            listMode: 'hide'
        });
        renderGraphicLayer.id = 'RGLayer';
        mapApp.map.add(renderGraphicLayer); // 数据量过大无法完全展示
        mapApp.view.goTo({
            target: renderGraphicLayer.graphics.items[0].geometry.extent,
            zoom: mapApp.view.constraints.maxZoom
        });
    }
    exports.showSelectedFeature = showSelectedFeature;
});
