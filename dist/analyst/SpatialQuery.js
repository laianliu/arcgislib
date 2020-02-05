define(["require", "exports", "esri/tasks/support/Query", "esri/tasks/QueryTask", "esri/layers/GraphicsLayer", "esri/request", "esri/core/urlUtils"], function (require, exports, Query_1, QueryTask_1, GraphicsLayer_1, request_1, urlUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SpatialQuery = /** @class */ (function () {
        function SpatialQuery(mapApp, layerId, geometry) {
            this.mapApp = mapApp;
            this.layerId = layerId;
            this.queryLayer = this.mapApp
                ? this.mapApp.findLayerById(this.layerId)
                : null;
            this.geometry = geometry || null;
            this.isMultiSelected = false;
            this.selectedFeatures = [];
            this.renderGraphicLayer = null;
            this.maxRecordCount = 1000;
            this.paginationCount = 0;
            this.BatchRecordCount = 30;
            this.startIndex = null;
            this.dialog = null;
        }
        SpatialQuery.prototype.querySelectedFeatures = function () {
            //   if (!geometry || !layerId) return
            //   let queryLayer = this.mapApp ? this.mapApp.findLayerById(me.layerId) : null
            if (this.queryLayer) {
                var me_1 = this;
                this.queryCount().then(function (count) {
                    console.log('一共有' + count + '条记录');
                    if (count === 0)
                        return;
                    if (count <= me_1.maxRecordCount) {
                        me_1.queryFeatures().then(function (result) {
                            if (!me_1.isMultiSelected) {
                                me_1.selectedFeatures = [];
                            }
                            result.features.map(function (feature) {
                                me_1.selectedFeatures.push(feature);
                            });
                            me_1.mapApp.selectedFeatures['' + me_1.layerId] = me_1.selectedFeatures;
                            me_1.showSelectedFeatures(me_1.selectedFeatures);
                            me_1.mapApp.res['' + me_1.layerId] = result.features.reduce(function (arr, cur) {
                                arr.concat(cur.attributes);
                            }, []);
                        });
                    }
                    else {
                        me_1.dialog = confirm('选择要素的数量超过系统限制(1000)，是否继续？');
                        if (!me_1.dialog) {
                            return null;
                        }
                        me_1.paginationCount = Math.ceil(count / me_1.maxRecordCount);
                        var promiseArray = [];
                        for (var i = 0; i < me_1.paginationCount; i += 1) {
                            me_1.startIndex = i * me_1.maxRecordCount;
                            promiseArray.push(me_1.queryFeatures().then(function (result) {
                                return result;
                            }));
                        }
                        Promise.all(promiseArray)
                            .then(function (result) {
                            if (!me_1.isMultiSelected) {
                                me_1.selectedFeatures = [];
                            }
                            result.forEach(function (e) {
                                e.features.map(function (feature) {
                                    me_1.selectedFeatures.push(feature);
                                });
                            });
                            me_1.showSelectedFeatures(me_1.selectedFeatures);
                            me_1.mapApp.res['' + me_1.layerId] = [];
                            result = result
                                .reduce(function (arr, cur) {
                                arr.push(cur.features);
                                return arr;
                            }, [])
                                .reduce(function (arr, cur) {
                                arr.concat(cur);
                            }, []);
                            result.forEach(function (e) {
                                me_1.mapApp.res['' + me_1.layerId].push(e.attributes);
                            });
                        })
                            .catch(function (err) {
                            console.error(err);
                        });
                    }
                });
            }
            return null;
        };
        SpatialQuery.prototype.queryCount = function () {
            //   if (!geometry || !queryLayer) return
            var foo = this.query();
            foo.query.returnGeometry = false;
            return foo.task.executeForCount(foo.query);
        };
        SpatialQuery.prototype.query = function () {
            var queryUrl = this.queryLayer.url + '/0';
            var task = new QueryTask_1.default({
                url: queryUrl
            });
            var query = new Query_1.default();
            query.outSpatialReference = this.queryLayer.spatialReference;
            query.geometry = this.geometry;
            return {
                task: task,
                query: query
            };
        };
        SpatialQuery.prototype.createQueryCount = function (layer, geometry) {
            var queryUrl = layer.url + '/0';
            var task = new QueryTask_1.default({
                url: queryUrl
            });
            var query = new Query_1.default({
                outSpatialReference: layer.spatialReference,
                geometry: geometry,
                returnGeometry: false
            });
            return task.executeForCount(query);
        };
        SpatialQuery.prototype.createQueryFeatures = function (layer, geometry) {
            var queryUrl = layer.url + '/0';
            var task = new QueryTask_1.default({
                url: queryUrl
            });
            var query = new Query_1.default({
                outSpatialReference: layer.spatialReference,
                geometry: geometry,
                returnGeometry: true,
                outFields: ['*']
            });
            return task.execute(query);
        };
        SpatialQuery.prototype.queryFeatures = function () {
            //   if (!geometry || !queryLayer) return
            // 大数据轮询
            var foo = this.query();
            foo.query.returnGeometry = true;
            foo.query.outFields = ['*'];
            return foo.task.execute(foo.query);
        };
        SpatialQuery.prototype.showSelectedFeatures = function (selectedFeatures) {
            if (!this.mapApp || !selectedFeatures)
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
            if (Object.prototype.toString.call(selectedFeatures) === '[object Array]') {
                selectedFeatures.map(function (graphic) {
                    graphic.symbol = symbol;
                    graphics.push(graphic);
                });
            }
            else {
                selectedFeatures.symbol = symbol;
                graphics.push(selectedFeatures);
            }
            // 移除上次选择图层（若存在）
            if (this.mapApp.findLayerById('RGLayer')) {
                this.mapApp.removeLayerById('RGLayer');
            }
            this.renderGraphicLayer = new GraphicsLayer_1.default({
                graphics: graphics,
                listMode: 'hide'
            });
            this.renderGraphicLayer.id = 'RGLayer';
            this.mapApp.map.add(this.renderGraphicLayer); // 数据量过大无法完全展示
        };
        SpatialQuery.prototype.createQueryTask = function (url, data) {
            var options = {
                body: data,
                timeout: 180000,
                method: 'post',
                responseType: 'json'
            };
            return request_1.default(url, options);
        };
        SpatialQuery.prototype.createQueryTask2 = function (url, data) {
            var options = {
                body: data,
                timeout: 180000,
                method: 'post',
                responseType: 'document',
                // useProxy: this.mapApp.httpProxy.useProxy,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            return request_1.default(urlUtils_1.default.addProxy(url).trim(), options);
        };
        return SpatialQuery;
    }());
    exports.default = SpatialQuery;
});
