import { loadScript, loadCss, loadModules } from 'esri-loader'
export function loadGISUri(uriObj) {
    if (!uriObj) return
    return new Promise(resolve => {
        if (uriObj.cssUris) {
            CSSRuleList.forEach(cssUri => {
                loadCss(cssUri)
            })
            if (uriObj.jsUri) {
                loadScript({ url: uriObj.jsUri }).then(res => {
                    console.log('GISUri Loaded!')
                    resolve(true)
                })
            }
        }
    })
}

export function loadGISModules(modules, dojoConfig) {
    const locationPath = location.pathname.replace(/\/[^\/]+$/, '')
    window.dojoConfig = dojoConfig || {
        packages: [{
            name: 'epf-gislib',
            location: locationPath + '/dist'
        }]
    }
    const myModules = modules || 'epf-gislib/MapAppFactory'
    return new Promise(resolve => {
        loadModules(myModules).then(args => {
            let gisConstructor = {}
            let name = null
            for (let k in args) {
                name = myModules[k].split('/').pop()
                gisConstructor[name] = args[k]
            }
            resolve(gisConstructor)
        })
    })
}