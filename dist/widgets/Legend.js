var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/widgets/Expand", "esri/widgets/Legend"], function (require, exports, Expand_1, Legend_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Expand_1 = __importDefault(Expand_1);
    Legend_1 = __importDefault(Legend_1);
    var Legend = /** @class */ (function () {
        function Legend(view, position, index) {
            this.legend = new Legend_1.default({
                view: view,
                style: 'classic',
                layout: 'side-by-side'
            });
            this.expand = new Expand_1.default({
                content: this.legend,
                view: view,
                expandTooltip: '查看图例',
                expandIconClass: 'esri-icon-review'
            });
            view.ui.add(this.expand, position, index);
        }
        return Legend;
    }());
    exports.default = Legend;
});
