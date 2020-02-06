define(["require", "exports", "esri/core/urlUtils", "esri/config"], function (require, exports, urlUtils, esriConfig) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function addProxyRule(layerInfo) {
        var httpProxy = esriConfig.appConfig.httpProxy;
        if (layerInfo.url && httpProxy.localUseProxy) {
            urlUtils.addProxyRule({
                proxyUrl: httpProxy.localProxyUrl,
                urlPrefix: layerInfo.url
            });
        }
    }
    exports.addProxyRule = addProxyRule;
    function addTDTProxy(layerInfo) {
        var newLayerInfo = layerInfo;
        var httpProxy = esriConfig.appConfig.httpProxy;
        if (esriConfig.appConfig.httpProxy.tdtUseProxy) {
            newLayerInfo.proxyUrl = httpProxy.tdtProxyUrl;
        }
        return newLayerInfo;
    }
    exports.addTDTProxy = addTDTProxy;
});
