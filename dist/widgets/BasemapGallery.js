define(["require", "exports", "esri/widgets/Expand", "esri/widgets/BasemapGallery", "../LayerFactory", "esri/config", "esri/widgets/BasemapGallery/support/LocalBasemapsSource"], function (require, exports, Expand_1, BasemapGallery_1, LayerFactory_1, config_1, LocalBasemapsSource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BasemapGallery = /** @class */ (function () {
        function BasemapGallery(view, position, index) {
            var basemapGallery = new BasemapGallery_1.default({
                view: view,
                source: this.getSource()
            });
            var basemapGalleryExpand = new Expand_1.default({
                content: basemapGallery,
                view: view,
                group: position,
                expandTooltip: '底图切换'
            });
            view.ui.add({
                component: basemapGalleryExpand,
                position: position,
                index: index
            });
        }
        BasemapGallery.prototype.getSource = function () {
            return new LocalBasemapsSource_1.default({
                basemaps: LayerFactory_1.default.getBaseMaps(config_1.default.appConfig.map.basemaps)
            });
        };
        return BasemapGallery;
    }());
    exports.default = BasemapGallery;
});
