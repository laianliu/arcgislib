import urlUtils from 'esri/core/urlUtils'
import esriConfig from 'esri/config'
export function addProxyRule(layerInfo: {}) {
  const httpProxy = esriConfig.appConfig.httpProxy
  if (layerInfo.url && httpProxy.localUseProxy) {
    urlUtils.addProxyRule({
      proxyUrl: httpProxy.localProxyUrl,
      urlPrefix: layerInfo.url
    })
  }
}
export function addTDTProxy(layerInfo: {}) {
  let newLayerInfo = layerInfo
  const httpProxy = esriConfig.appConfig.httpProxy
  if (esriConfig.appConfig.httpProxy.tdtUseProxy) {
    newLayerInfo.proxyUrl = httpProxy.tdtProxyUrl
  }
  return newLayerInfo
}
