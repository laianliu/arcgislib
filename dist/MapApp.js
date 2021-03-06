var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/views/SceneView", "esri/Graphic", "esri/geometry/support/jsonUtils", "./analyst/AttributeQuery", "./analyst/SpatialQuery", "esri/geometry/Point", "esri/config", "./LayerFactory", "./utils", "esri/request", "esri/tasks/QueryTask", "esri/tasks/support/Query", "./widgetUtils", "./epsg/4326", "esri/core/promiseUtils", "esri/core/watchUtils"], function (require, exports, Map_1, MapView_1, SceneView_1, Graphic_1, jsonUtils, AttributeQuery_1, SpatialQuery_1, Point_1, esriConfig, LayerFactory, utils, esriRequest, QueryTask_1, Query_1, widgetUtils, epsg4326, promiseUtils, watchUtils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Map_1 = __importDefault(Map_1);
    MapView_1 = __importDefault(MapView_1);
    SceneView_1 = __importDefault(SceneView_1);
    Graphic_1 = __importDefault(Graphic_1);
    AttributeQuery_1 = __importDefault(AttributeQuery_1);
    SpatialQuery_1 = __importDefault(SpatialQuery_1);
    Point_1 = __importDefault(Point_1);
    QueryTask_1 = __importDefault(QueryTask_1);
    Query_1 = __importDefault(Query_1);
    var MapApp = /** @class */ (function () {
        function MapApp(appConfig, callBackFn) {
            this.polySymbol = {
                type: 'simple-fill',
                color: [0, 255, 255, 0.7],
                outline: {
                    color: [0, 255, 255],
                    width: 2
                }
            };
            this.pointSymbol = {
                type: 'simple-marker',
                color: [255, 0, 0],
                outline: {
                    color: [255, 255, 255],
                    width: 2
                }
            };
            this.map = null;
            this.mapType = null;
            this.view = null;
            this.widgets = [];
            this.widgetInstance = {};
            this.linkedState = false;
            this.visible = true;
            this.res = [];
            this.selectedFeatures = [];
            this.baseLayers = [];
            this.operationLayers = [];
            this.httpProxy = {};
            this.mapType = appConfig.map['2D'] === true ? '2D' : '3D';
            this.name = appConfig.view.container;
            this.callBackFn = callBackFn;
            this.layerLoadedObj = {};
            this.appConfig = appConfig;
            esriConfig.appConfig = appConfig;
            esriConfig.mapType = this.mapType;
            esriConfig.httpProxy = appConfig.httpProxy;
            var viewOptions = appConfig.view;
            viewOptions.constraints = viewOptions.constraints || {};
            if (appConfig.httpProxy) {
                this.httpProxy = appConfig.httpProxy;
            }
            var initBasemaps = appConfig.map["basemaps_" + this.mapType.toLowerCase()][0] || [];
            esriConfig.appConfig.epsg = epsg4326;
            this.initMap(initBasemaps, viewOptions);
            utils.createCustomCorner(this.view);
            this.initWidget(appConfig.widgets || []);
            this.executeNewMethods();
            window["MapApp_" + this.mapType.toLowerCase()] = this;
        }
        MapApp.prototype.initMap = function (initBasemaps, viewOptions) {
            var me = this;
            if (initBasemaps.length > 0) {
                var baseMap = LayerFactory.createBaseLayer(initBasemaps, this.callBackFn);
                this.map = new Map_1.default({
                    basemap: baseMap
                });
            }
            else {
                this.map = new Map_1.default();
            }
            var option = JSON.parse(JSON.stringify(viewOptions));
            option.map = this.map;
            if (this.mapType === '2D') {
                var minZoom = option.constraints.minZoom;
                var maxZoom = option.constraints.maxZoom;
                option.scale = esriConfig.appConfig.epsg.lods[minZoom + 1].scale;
                option.constraints.lods = esriConfig.appConfig.epsg.lods;
                option.constraints.minScale = esriConfig.appConfig.epsg.lods[minZoom].scale;
                option.constraints.maxScale = esriConfig.appConfig.epsg.lods[maxZoom].scale;
            }
            if (this.mapType === '2D') {
                this.view = new MapView_1.default(option);
            }
            else if (this.mapType === '3D') {
                this.view = new SceneView_1.default(option);
            }
        };
        MapApp.prototype.executeNewMethods = function () {
            this.addMaskLayer();
            this.addXZQHLayer();
        };
        MapApp.prototype.addMaskLayer = function () {
            var me = this;
            if (this.appConfig.map.maskService.disable) {
                var maskService = this.appConfig.map.maskService;
                var borderLayer = LayerFactory.createLayer(maskService);
                this.baseLayers.push(borderLayer);
                this.addLayer(borderLayer);
                var pathArr_1 = [];
                this.getServiceStatus(maskService.url).then(function (res) {
                    var layers = res.data.layers;
                    var url = res.url;
                    layers.forEach(function (layer, index) {
                        me.getServiceInfo(url + '/' + index).then(function (response) {
                            response.features.forEach(function (feature) {
                                feature.geometry.paths.forEach(function (path) {
                                    pathArr_1.push(path);
                                });
                            });
                            if (index === layers.length - 1) {
                                var mySymbol = this.appConfig.map.maskService.symbol;
                                var maskInfo = { points: pathArr_1, symbol: mySymbol };
                                var maskLayer = LayerFactory.createMaskLayer(maskInfo);
                                me.addLayer(maskLayer);
                                me.baseLayers.push(maskLayer);
                            }
                        });
                    });
                });
            }
        };
        MapApp.prototype.addXZQHLayer = function (init, visible) {
            var me = this;
            var xzqhService = this.appConfig.map.xzqhService;
            if (xzqhService.disable || init) {
                this.getServiceInfo(xzqhService.url).then(function (res) {
                    var features = res.features;
                    var gLayer = LayerFactory.createGraphicLayer(features, xzqhService.needTransform || false, xzqhService.colors);
                    gLayer.id = xzqhService.id;
                    gLayer.title = xzqhService.title;
                    if (typeof visible === 'boolean') {
                        gLayer.visible = visible;
                    }
                    else {
                        gLayer.visible = true;
                    }
                    me.addLayer(gLayer);
                });
            }
        };
        MapApp.prototype.addDynamicLayer = function (option) {
            return LayerFactory.createDynamicLayer(option);
        };
        MapApp.prototype.addDynamicLayer2 = function (params, name) {
            return LayerFactory.createDynamicLayer2(params, name);
        };
        MapApp.prototype.initWidget = function (widgets) {
            var _this = this;
            if (this.view) {
                var me_1 = this;
                this.view.ui.components.forEach(function (c) { return _this.view.ui.remove(c); });
                utils.visitConf(widgets, function (widget, index) {
                    var newWidget = widgetUtils.createWidget(widget.name, me_1.view, widget.position, index);
                    me_1.widgets.push(newWidget);
                });
            }
        };
        MapApp.prototype.visitConf = function (items, fn) {
            items.forEach(function (item) {
                fn(item);
            });
        };
        MapApp.prototype.createLayer = function (layerInfo) {
            return LayerFactory.createLayer(layerInfo);
        };
        MapApp.prototype.getServiceAllLayers = function (url) {
            return esriRequest(url, {
                responseType: 'json'
            });
        };
        MapApp.prototype.getServiceStatus = function (url) {
            return esriRequest(url, {
                query: {
                    f: 'json'
                },
                responseType: 'json'
            });
        };
        MapApp.prototype.getDataFromNormalService = function (url, data, method) {
            var option = {
                body: data,
                timeout: 180000,
                method: method || 'post',
                responseType: 'json'
            };
            return esriRequest(url, option);
        };
        // 获取服务信息
        MapApp.prototype.getServiceInfo = function (url) {
            var query = new Query_1.default();
            query.outFields = ['*'];
            query.where = '1=1';
            query.returnGeometry = true;
            var queryTask = new QueryTask_1.default(url);
            return queryTask.execute(query);
        };
        MapApp.prototype.getDynamicLayerInfo = function (url, query) {
            var queryTask = new QueryTask_1.default(url);
            return queryTask.execute(query);
        };
        MapApp.prototype.watchLayerLoaded = function (layerId, callback) {
            // let val
            // Object.defineProperty(this.layerLoadedObj, layerId, {
            //     set: function(newVal) {
            //         val = newVal
            //         callback(val)
            //     },
            //     get: function() {
            //         return val
            //     }
            // })
            watchUtils.watch(this.layerLoadedObj, layerId, callback);
        };
        MapApp.prototype.addLayerEvent = function (layerId, eventName, callback) {
            var me = this;
            if (!this.view)
                return;
            this.view[layerId + eventName] = this.view.on(eventName, function (event) {
                me.view.hitTest(event).then(function (res) {
                    if (res.results.length > 0) {
                        var result = res.results.find(function (result) {
                            result.graphic.layer.id === layerId;
                        });
                        callback(result);
                    }
                });
            });
        };
        MapApp.prototype.removeLayerEvent = function (layerId, eventName) {
            this.view[layerId + eventName].remove();
        };
        /**
         * 添加图层到地图
         * @param {图层配置} layerInfo
         * to 前端 ，动态添加已发布图层（目录树）
         */
        MapApp.prototype.addLayerToMap = function (layerInfo) {
            var me = this;
            return promiseUtils.create(function (resolve) {
                var layer = me.createLayer(layerInfo);
                me.addLayer(layer).then(function (res) {
                    resolve(res);
                });
            });
        };
        MapApp.prototype.addLayer = function (layer, index) {
            var me = this;
            me.layerLoadedObj[layer.id] = false;
            return promiseUtils.create(function (resolve) {
                layer
                    .load()
                    .then(function (res) {
                    if (res.message !== 'Error') {
                        me.map.add(layer, index);
                    }
                    else {
                        if (me.callBackFn) {
                            me.callBackFn(res.message);
                        }
                    }
                    me.layerLoadedObj[layer.id] = true;
                    res.layer = layer;
                    resolve(res);
                })
                    .catch(function (error) {
                    if (me.callBackFn) {
                        me.callBackFn(error.message);
                    }
                    resolve(error);
                });
            });
        };
        /**
         * 根据图层id获取图层index
         * @param {图层id} layerId
         */
        MapApp.prototype.findLayerIndexById = function (layerId) {
            this.map.layers.items.findIndex(function (layer) {
                return layer.id === layerId;
            });
        };
        /**
         * 图层排序功能（上移、下移、置顶、置底）
         * @param {图层id} layerId
         * @param {排序指令} command
         */
        MapApp.prototype.reorderLayer = function (layerId, command) {
            var layer = this.findLayerById(layerId);
            var layerIndex = this.findLayerIndexById(layerId);
            var layersLength = this.map.layers.items.length;
            if (layer && typeof layerIndex !== 'undefined') {
                if (layerIndex === 0 && command === 'bottom')
                    return;
                if (layerIndex === layersLength - 1 && command === 'top')
                    return;
                switch (command) {
                    case 'up':
                        this.map.reorder(layer, layerIndex + 1);
                        break;
                    case 'down':
                        this.map.reorder(layer, layerIndex - 1);
                        break;
                    case 'top':
                        this.map.reorder(layer, layersLength - 1);
                        break;
                    case 'bottom':
                        this.map.reorder(layer, 0);
                        break;
                }
            }
        };
        /**
         * to 前端 通过id来查找图层
         * @param {图层id} id
         */
        MapApp.prototype.findLayerById = function (layerId) {
            if (!layerId)
                return null;
            var layer = this.map.findLayerById(layerId);
            return layer;
        };
        MapApp.prototype.removeLayer = function (layer) {
            this.map.remove(layer);
        };
        /**
         * 移除所有图层
         */
        MapApp.prototype.removeAllLayer = function () {
            this.operationLayers.forEach(function (layer, index) {
                this.map.remove(layer);
            });
        };
        /**
         * 根据图层id移除图层
         * @param {图层id} layerId
         */
        MapApp.prototype.removeLayerById = function (layerId) {
            var layer = this.findLayerById(layerId);
            if (layer) {
                return this.removeLayer(layer);
            }
            else {
                throw new Error('指定图层不存在');
            }
        };
        /**
         *设置图层显隐性
         * @param {图层id} layerId
         * @param {布尔类型} toShow
         */
        MapApp.prototype.setLayerVisiblity = function (layerId, toShow) {
            var layer = this.findLayerById(layerId);
            if (typeof toShow === 'boolean') {
                if (layer)
                    layer.visible = toShow;
                if (toShow === true) {
                    this.operationLayers.push(layer);
                }
                else {
                    var index = this.findLayerIndex(layerId);
                    this.operationLayers.splice(index, 1);
                }
            }
        };
        MapApp.prototype.findLayerIndex = function (layerId) {
            var index = 0;
            for (var i = 0; i < this.operationLayers.length; i++) {
                if (this.operationLayers[i].id === layerId) {
                    index = i;
                    break;
                }
            }
            return index;
        };
        /**
         * 设置图层透明度
         * @param {图层id} layerId
         * @param {透明度} opacity
         */
        MapApp.prototype.setLayerOpacity = function (layerId, opacity) {
            var layer = this.findLayerById(layerId);
            if (typeof opacity === 'number') {
                if (layer)
                    layer.opacity = opacity;
            }
        };
        MapApp.prototype.getAllLayer = function () {
            return this.operationLayers;
        };
        MapApp.prototype.setBaseLayerVisiblity = function () { };
        MapApp.prototype.showSelectedFeature = function (feature) {
            LayerFactory.showSelectedFeature(this, feature);
        };
        MapApp.prototype.showAllFeatures = function (features) {
            LayerFactory.showAllFeatures(this, features);
        };
        /**
         *
         * @param {监听的属性} attrName
         * @param {回调方法} callback
         */
        MapApp.prototype.addAttributeListener = function (attrName, fn) {
            if (!this.view)
                return;
            return this.view.watch(attrName, fn);
        };
        MapApp.prototype.createAttributeQuery = function (mapApp, layerId, extent) {
            return new AttributeQuery_1.default(mapApp, layerId, extent);
        };
        MapApp.prototype.createSpatialQuery = function (mapApp, layerId, geometry) {
            return new SpatialQuery_1.default(mapApp, layerId, geometry);
        };
        /**
         * 解析geojson对象为GraphicsLayer
         * @param {geojson对象} geojson
         * @param {解析类} parser
         */
        MapApp.prototype.parseJsonLayer = function (geojson, parser) {
            for (var i in geojson.features) {
                var geojson_geometry = parser.convert(geojson.features[i].geometry);
                var arcgis_geometry = jsonUtils.fromJSON(geojson_geometry);
                var attributes = geojson.features[i].properties;
                var g = new Graphic_1.default({
                    geometry: arcgis_geometry,
                    symbol: geojson.features[i].geometry.type === 'Point'
                        ? this.pointSymbol
                        : this.polySymbol,
                    attributes: attributes
                });
                this.view.graphics.add(g);
            }
        };
        MapApp.prototype.addPoint = function (x, y) {
            var p = new Point_1.default({
                longitude: Number(x),
                latitude: Number(y),
                spatialReference: this.view.extent.spatialReference
            });
            var g = new Graphic_1.default({
                geometry: p,
                symbol: this.pointSymbol
            });
            this.view.graphics.add(g);
        };
        MapApp.prototype.createLegend = function (container) {
            this.widgetInstance.legend = widgetUtils.createLegend(this.view, container);
        };
        return MapApp;
    }());
    exports.default = MapApp;
});
