define(["require", "exports", "esri/widgets/ScaleBar"], function (require, exports, ScaleBar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ScaleBar = /** @class */ (function () {
        function ScaleBar(view, position, index) {
            var scaleBar = new ScaleBar_1.default({
                view: view,
                unit: 'metric'
            });
            view.ui.add(scaleBar, position, index);
        }
        return ScaleBar;
    }());
    exports.default = ScaleBar;
});
