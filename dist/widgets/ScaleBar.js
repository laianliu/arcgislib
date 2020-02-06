define(["require", "exports", "esri/widgets/ScaleBar"], function (require, exports, ScaleBar1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ScaleBar = /** @class */ (function () {
        function ScaleBar(view, position, index) {
            var scaleBar = new ScaleBar1({
                view: view,
                unit: 'metric'
            });
            view.ui.add(scaleBar, position, index);
        }
        return ScaleBar;
    }());
    exports.default = ScaleBar;
});
