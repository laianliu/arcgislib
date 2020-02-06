var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/widgets/Print"], function (require, exports, Print_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Print_1 = __importDefault(Print_1);
    var Print = /** @class */ (function () {
        function Print(view, position, index) {
            this.print = null;
            this.panel = document.getElementById('printPanel');
            this.print = new Print_1.default({
                view: view,
                style: 'card',
                printServiceUrl: 'http://120.77.57.182:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
                container: this.panel
            });
        }
        return Print;
    }());
    exports.default = Print;
});
