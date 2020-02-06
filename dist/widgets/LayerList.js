var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/widgets/Expand", "esri/widgets/LayerList"], function (require, exports, Expand_1, LayerList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Expand_1 = __importDefault(Expand_1);
    LayerList_1 = __importDefault(LayerList_1);
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
