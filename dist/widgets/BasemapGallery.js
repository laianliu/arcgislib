var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/widgets/Expand", "esri/widgets/BasemapGallery", "../LayerFactory", "esri/config", "esri/widgets/BasemapGallery/support/LocalBasemapsSource"], function (require, exports, Expand_1, BasemapGallery_1, LayerFactory, esriConfig, LocalBasemapsSource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Expand_1 = __importDefault(Expand_1);
    BasemapGallery_1 = __importDefault(BasemapGallery_1);
    LocalBasemapsSource_1 = __importDefault(LocalBasemapsSource_1);
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
                basemaps: LayerFactory.getBaseMaps(esriConfig.appConfig.map.basemaps)
            });
        };
        return BasemapGallery;
    }());
    exports.default = BasemapGallery;
});
