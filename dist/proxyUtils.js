define(["require", "exports", "esri/core/urlUtils", "esri/config"], function (require, exports, urlUtils_1, config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function addProxyRule(layerInfo) {
        var httpProxy = config_1.default.appConfig.httpProxy;
        if (layerInfo.url && httpProxy.localUseProxy) {
            urlUtils_1.default.addProxyRule({
                proxyUrl: httpProxy.localProxyUrl,
                urlPrefix: layerInfo.url
            });
        }
    }
    exports.addProxyRule = addProxyRule;
    function addTDTProxy(layerInfo) {
        var newLayerInfo = layerInfo;
        var httpProxy = config_1.default.appConfig.httpProxy;
        if (config_1.default.appConfig.httpProxy.tdtUseProxy) {
            newLayerInfo.proxyUrl = httpProxy.tdtProxyUrl;
        }
        return newLayerInfo;
    }
    exports.addTDTProxy = addTDTProxy;
});
