define(["require", "exports", "esri/config", "esri/widgets/BasemapToggle", "../LayerFactory"], function (require, exports, config_1, BasemapToggle_1, LayerFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BasemapToggle = /** @class */ (function () {
        function BasemapToggle(view, position, index) {
            var nextBasemap = LayerFactory_1.default.createBaseLayer(config_1.default.appConfig.map.basemaps[1]);
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
