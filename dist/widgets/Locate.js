var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/widgets/Locate"], function (require, exports, Locate_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Locate_1 = __importDefault(Locate_1);
    var Locate = /** @class */ (function () {
        function Locate(view, position, index) {
            this.locate = new Locate_1.default({
                view: view
            });
            view.ui.add(this.locate, position, index);
        }
        return Locate;
    }());
    exports.default = Locate;
});
