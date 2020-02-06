var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/core/lang", "esri/core/promiseUtils", "./MapApp"], function (require, exports, lang, promiseUtils, MapApp_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    MapApp_1 = __importDefault(MapApp_1);
    var MapAppFactory = /** @class */ (function () {
        function MapAppFactory() {
            this.mapApps = {};
            this.appConfig = null;
        }
        MapAppFactory.prototype.createMapApp = function (appConfig, fn) {
            var me = this;
            if (!appConfig)
                return;
            var curMapApp = this.mapApps[appConfig.mapview.container];
            return promiseUtils.create(function (resolve) {
                if (appConfig.delay > 0) {
                    setTimeout(function () {
                        var mapApp = curMapApp || me._createMapApp(appConfig, fn);
                        resolve(mapApp);
                    }, appConfig.delay);
                }
                else {
                    var mapApp = curMapApp || me._createMapApp(appConfig, fn);
                    resolve(mapApp);
                }
            });
        };
        MapAppFactory.prototype._createMapApp = function (appConfig, fn) {
            if (appConfig.mapview.map)
                delete appConfig.mapview.map;
            var mapAppId = appConfig.mapview.container;
            var currentAppConfig = lang.clone(appConfig);
            var currentMapApp = null;
            if (!this.mapApps[mapAppId]) {
                currentMapApp = new MapApp_1.default(currentAppConfig, fn);
                this.mapApps[mapAppId] = currentMapApp;
                if (appConfig.mapview.linked) {
                    this.setMappAppState(mapAppId, true);
                }
            }
            else {
                if (!this.mapApps[mapAppId].visible) {
                    if (appConfig.mapview.linked) {
                        this.setMappAppState(this.mapApps[mapAppId]);
                    }
                }
                currentMapApp = this.mapApps[mapAppId];
            }
            this.mapApps[mapAppId].visible = true;
            return currentMapApp;
        };
        MapAppFactory.prototype.destroyMapApp = function (mapAppId) {
            delete this.mapApps[mapAppId];
        };
        MapAppFactory.prototype.watchMapApp = function (mapAppId, callback) {
            var mapApp = this.mapApps[mapAppId];
            var val;
            Object.defineProperty(mapApp, 'view', {
                set: function (newVal) {
                    val = newVal;
                    callback(val);
                },
                set: function () {
                    return val;
                }
            });
        };
        MapAppFactory.prototype.getArrDiff = function (arr1, arr2) {
            return arr1.concat(arr2).filter(function (value, i, arr) {
                return arr.indexOf(value) === arr.lastIndexOf(value);
            });
        };
        MapAppFactory.prototype.removeEventLinstener = function (mapAppId) {
            this.mapApps[mapAppId].visible = false;
            this.mapApps[mapAppId].view.extentListener.remove();
            this.mapApps[mapAppId].view.rotationListener.remove();
        };
        MapAppFactory.prototype.findMapApp = function (mapAppId) {
            return this.mapApps[mapAppId];
        };
        /**
         *
         * @param {地图div id} mapAppId
         */
        MapAppFactory.prototype.setMappAppState = function (mapAppId, isInit) {
            if (this.mapApps[mapAppId]) {
                if (this.mapApps[mapAppId].linkedState && !isInit) {
                    this.mapApps[mapAppId].linkedState = false;
                    this.removeEventLinstener(mapAppId);
                }
                else {
                    this.mapApps[mapAppId].linkedState = true;
                    this.addEventLinstener(mapAppId);
                }
            }
        };
        MapAppFactory.prototype.addEventLinstener = function (mapAppId) {
            this.mapApps[mapAppId].visible = true;
            this.addExtentChangeListener(mapAppId);
            this.addRotationChangeListener(mapAppId);
        };
        MapAppFactory.prototype.addExtentChangeListener = function (mapAppId) {
            if (!this.mapApps)
                return;
            var me = this;
            var hasExtentLinstener = this.mapApps[mapAppId].view.hasEventListener('extent');
            if (!hasExtentLinstener) {
                this.mapApps[mapAppId].view.extentListener = this.mapApps[mapAppId].addAttributeListener('extent', function (response) {
                    if (me.mapApps[mapAppId]) {
                        if (me.mapApps[mapAppId].linkedState) {
                            var currentMapApps = Object.keys(me.mapApps);
                            for (var i = 0; i < currentMapApps.length; i++) {
                                if (currentMapApps[i] !== mapAppId) {
                                    var targetMapApp = me.mapApps[currentMapApps[i]];
                                    if (targetMapApp.linkedState && targetMapApp.visible) {
                                        var targetMapAppExtent = targetMapApp.view.extent;
                                        if (targetMapAppExtent) {
                                            if (targetMapAppExtent.xmax !== response.xmax ||
                                                targetMapAppExtent.ymax !== response.ymax) {
                                                targetMapApp.view.extent = response;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
        };
        MapAppFactory.prototype.addRotationChangeListener = function (mapAppId) {
            if (!this.mapApps)
                return;
            var me = this;
            var hasRotationLinstener = this.mapApps[mapAppId].view.hasEventListener('rotation');
            if (!hasRotationLinstener) {
                this.mapApps[mapAppId].view.rotationListener = this.mapApps[mapAppId].addAttributeListener('rotation', function (response) {
                    if (me.mapApps[mapAppId]) {
                        if (me.mapApps[mapAppId].linkedState) {
                            var currentMapApps = Object.keys(me.mapApps);
                            for (var i = 0; i < currentMapApps.length; i++) {
                                if (currentMapApps[i] !== mapAppId) {
                                    var targetMapApp = me.mapApps[currentMapApps[i]];
                                    if (targetMapApp.linkedState && targetMapApp.visible) {
                                        var targetMapAppRotation = targetMapApp.view.rotation;
                                        if (typeof targetMapAppRotation !== 'undefined') {
                                            if (targetMapAppRotation !== response) {
                                                targetMapApp.view.rotation = response;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
        };
        return MapAppFactory;
    }());
    exports.default = MapAppFactory;
    var instance = null;
    function getInstance() {
        if (instance === null) {
            instance = new MapAppFactory();
        }
        return instance;
    }
    exports.getInstance = getInstance;
});
