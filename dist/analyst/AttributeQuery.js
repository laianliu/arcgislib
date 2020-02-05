define(["require", "exports", "esri/tasks/support/Query", "esri/tasks/QueryTask"], function (require, exports, Query_1, QueryTask_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AttributeQuery = /** @class */ (function () {
        function AttributeQuery(mapApp, layerId, extent) {
            this.layerId = layerId;
            this.extent = extent;
            this.mapApp = mapApp;
            this.layer = mapApp ? mapApp.findLayerById(this.layerId) : null;
            this.maxRecordCount = 1000; // 每次最大查询数
            this.paginationCount = 0; // 分批查询次数
            this.startIndex = 0;
        }
        AttributeQuery.prototype.startQuery = function () {
            var me = this;
            me.layer = this.mapApp ? this.mapApp.findLayerById(me.layerId) : null;
            me._queryCount(me.extent).then(function (count) {
                console.log('一共有' + count + '条记录');
                if (count <= me.maxRecordCount) {
                    me._queryAttributes(me.extent).then(function (results) {
                        this.mapApp.res['' + me.layerId] = results.features.reduce(function (arr, cur) {
                            arr.concat(cur.attributes);
                        }, []);
                    });
                }
                else {
                    me.paginationCount = Math.ceil(count / me.maxRecordCount);
                    var promiseArray = [];
                    for (var i = 0; i < me.paginationCount; i += 1) {
                        me.startIndex = i * me.maxRecordCount;
                        promiseArray.push(me._queryAttributes(me.extent).then(function (result) {
                            return result;
                        }));
                    }
                    Promise.all(promiseArray)
                        .then(function (result) {
                        this.mapApp.res = [];
                        result = result
                            .reduce(function (arr, cur) {
                            arr.push(cur.features);
                            return arr;
                        }, [])
                            .reduce(function (arr, cur) {
                            arr.concat(cur);
                        }, []);
                        result.forEach(function (e) {
                            this.mapApp.res['' + me.layerId].push(e.attributes);
                        });
                    })
                        .catch(function (err) {
                        console.error(err);
                    });
                }
            });
        };
        AttributeQuery.prototype.doQuery = function () {
            var task = new QueryTask_1.default({
                url: layerURL
            });
            var query = new Query_1.default({
                outFields: ['*'],
                returnGeometry: true,
                where: where
            });
            return task.execute(query);
        };
        AttributeQuery.prototype._doQuery = function () {
            var queryUrl = this.layer.url + '/0';
            var task = new QueryTask_1.default({
                url: queryUrl
            });
            var query = new Query_1.default();
            return { task: task, query: query };
        };
        AttributeQuery.prototype._queryCount = function () {
            var foo = this._doQuery();
            foo.query.outFields = ['*'];
            foo.query.where = '1=1';
            foo.query.returnGeometry = false;
            foo.query.geometry = this.extent;
            return foo.task.executeForCount(foo.query);
        };
        AttributeQuery.prototype._queryAttributes = function () {
            var foo = this._doQuery();
            foo.query.outFields = ['*'];
            foo.query.geometry = this.extent;
            foo.query.returnGeometry = false;
            // foo.query.where = "FID >= " + this.startIndex || 0; // 自己发布的服务要用FID
            return foo.task.execute(foo.query);
        };
        return AttributeQuery;
    }());
    exports.default = AttributeQuery;
});
