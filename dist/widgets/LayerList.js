define(["require", "exports", "esri/widgets/Expand", "esri/widgets/LayerList"], function (require, exports, Expand_1, LayerList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LayerList = /** @class */ (function () {
        function LayerList(view, position, index) {
            this.layerList = null;
            this.layerList = new Expand_1.default({
                content: new LayerList_1.default({
                    view: view
                }),
                view: view,
                group: 'top-right',
                expandTooltip: '图层列表'
            });
            view.ui.add(this.layerList, position, index);
        }
        return LayerList;
    }());
    exports.default = LayerList;
});
