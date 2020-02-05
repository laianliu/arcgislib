define(["require", "exports", "esri/widgets/Expand", "esri/widgets/AreaMeasurement2D", "esri/widgets/DistanceMeasurement2D"], function (require, exports, Expand_1, AreaMeasurement2D_1, DistanceMeasurement2D_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Measurement2D = /** @class */ (function () {
        function Measurement2D(view, position, index) {
            this.areaMeasurement2D = null;
            this.areaMeasurement2D = new Expand_1.default({
                view: view,
                content: null,
                group: 'top-right',
                expandIconClass: 'esri-icon-polygon',
                expandTooltip: '面积测量'
            });
            this.areaMeasurement2D.watch('expanded', function (expanded) {
                if (expanded) {
                    this.content = new AreaMeasurement2D_1.default({
                        view: view,
                        unit: 'square-meters',
                        iconClass: 'esri-icon-polygon'
                    });
                    this.content.viewModel.newMeasurement();
                }
                else {
                    this.content.destroy();
                }
            });
            this.distanceMeasurement2D = null;
            this.distanceMeasurement2D = new Expand_1.default({
                view: view,
                content: null,
                group: 'top-right',
                expandIconClass: 'esri-icon-minus',
                expandTooltip: '距离测量'
            });
            this.distanceMeasurement2D.watch('expanded', function (expanded) {
                if (expanded) {
                    this.content = new DistanceMeasurement2D_1.default({
                        view: view,
                        unit: 'square-meters',
                        iconClass: 'esri-icon-minus'
                    });
                    this.content.viewModel.newMeasurement();
                }
                else {
                    this.content.destroy();
                }
            });
            view.ui.add([this.areaMeasurement2D, this.distanceMeasurement2D], position, index);
        }
        return Measurement2D;
    }());
    exports.default = Measurement2D;
});
