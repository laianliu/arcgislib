var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/config", "esri/widgets/BasemapToggle", "../LayerFactory"], function (require, exports, esriConfig, BasemapToggle_1, LayerFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    BasemapToggle_1 = __importDefault(BasemapToggle_1);
    LayerFactory_1 = __importDefault(LayerFactory_1);
    var BasemapToggle = /** @class */ (function () {
        function BasemapToggle(view, position, index) {
            var nextBasemap = LayerFactory_1.default.createBaseLayer(esriConfig.appConfig.map.basemaps[1]);
            var toggle = new BasemapToggle_1.default({
                view: view,
                nextBasemap: nextBasemap
            });
            view.ui.add({
                component: toggle,
                position: position,
                index: index
            });
        }
        return BasemapToggle;
    }());
    exports.default = BasemapToggle;
});
