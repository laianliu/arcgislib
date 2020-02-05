import Query from 'esri/tasks/support/Query'
import QueryTask from 'esri/tasks/QueryTask'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import esriRequest from 'esri/request'
import esriConfig from 'esri/config'
import urlUtils from 'esri/core/urlUtils'
export default class SpatialQuery {
  constructor(mapApp: object, layerId: string, geometry: object) {
    this.mapApp = mapApp
    this.layerId = layerId
    this.queryLayer = this.mapApp
      ? this.mapApp.findLayerById(this.layerId)
      : null
    this.geometry = geometry || null
    this.isMultiSelected = false
    this.selectedFeatures = []
    this.renderGraphicLayer = null
    this.maxRecordCount = 1000
    this.paginationCount = 0
    this.BatchRecordCount = 30
    this.startIndex = null
    this.dialog = null
  }
  querySelectedFeatures() {
    //   if (!geometry || !layerId) return
    //   let queryLayer = this.mapApp ? this.mapApp.findLayerById(me.layerId) : null
    if (this.queryLayer) {
      let me = this
      this.queryCount().then(function(count) {
        console.log('一共有' + count + '条记录')
        if (count === 0) return
        if (count <= me.maxRecordCount) {
          me.queryFeatures().then(function(result) {
            if (!me.isMultiSelected) {
              me.selectedFeatures = []
            }
            result.features.map(function(feature) {
              me.selectedFeatures.push(feature)
            })
            me.mapApp.selectedFeatures['' + me.layerId] = me.selectedFeatures
            me.showSelectedFeatures(me.selectedFeatures)
            me.mapApp.res['' + me.layerId] = result.features.reduce(function(
              arr,
              cur
            ) {
              arr.concat(cur.attributes)
            },
            [])
          })
        } else {
          me.dialog = confirm('选择要素的数量超过系统限制(1000)，是否继续？')
          if (!me.dialog) {
            return null
          }

          me.paginationCount = Math.ceil(count / me.maxRecordCount)
          var promiseArray = []

          for (let i = 0; i < me.paginationCount; i += 1) {
            me.startIndex = i * me.maxRecordCount
            promiseArray.push(
              me.queryFeatures().then(function(result) {
                return result
              })
            )
          }
          Promise.all(promiseArray)
            .then(function(result) {
              if (!me.isMultiSelected) {
                me.selectedFeatures = []
              }
              result.forEach(function(e) {
                e.features.map(function(feature) {
                  me.selectedFeatures.push(feature)
                })
              })
              me.showSelectedFeatures(me.selectedFeatures)

              me.mapApp.res['' + me.layerId] = []
              result = result
                .reduce(function(arr, cur) {
                  arr.push(cur.features)
                  return arr
                }, [])
                .reduce(function(arr, cur) {
                  arr.concat(cur)
                }, [])

              result.forEach(function(e) {
                me.mapApp.res['' + me.layerId].push(e.attributes)
              })
            })
            .catch(function(err) {
              console.error(err)
            })
        }
      })
    }
    return null
  }

  queryCount() {
    //   if (!geometry || !queryLayer) return
    let foo = this.query()
    foo.query.returnGeometry = false
    return foo.task.executeForCount(foo.query)
  }
  query() {
    let queryUrl = this.queryLayer.url + '/0'
    let task = new QueryTask({
      url: queryUrl
    })
    let query = new Query()
    query.outSpatialReference = this.queryLayer.spatialReference
    query.geometry = this.geometry
    return {
      task: task,
      query: query
    }
  }
  createQueryCount(layer: object, geometry: object) {
    let queryUrl = layer.url + '/0'
    let task = new QueryTask({
      url: queryUrl
    })
    let query = new Query({
      outSpatialReference: layer.spatialReference,
      geometry: geometry,
      returnGeometry: false
    })

    return task.executeForCount(query)
  }
  createQueryFeatures(layer: object, geometry: object) {
    let queryUrl = layer.url + '/0'
    let task = new QueryTask({
      url: queryUrl
    })
    let query = new Query({
      outSpatialReference: layer.spatialReference,
      geometry: geometry,
      returnGeometry: true,
      outFields: ['*']
    })

    return task.execute(query)
  }
  queryFeatures() {
    //   if (!geometry || !queryLayer) return
    // 大数据轮询
    let foo = this.query()
    foo.query.returnGeometry = true
    foo.query.outFields = ['*']
    return foo.task.execute(foo.query)
  }
  showSelectedFeatures(selectedFeatures: object) {
    if (!this.mapApp || !selectedFeatures) return
    let graphics = []
    let symbol = {
      type: 'simple-fill', // 根据不同数据类型更改
      color: [0, 255, 255, 0.7],
      style: 'none',
      outline: {
        color: [0, 255, 255],
        width: 2
      }
    }
    if (Object.prototype.toString.call(selectedFeatures) === '[object Array]') {
      selectedFeatures.map(function(graphic) {
        graphic.symbol = symbol
        graphics.push(graphic)
      })
    } else {
      selectedFeatures.symbol = symbol
      graphics.push(selectedFeatures)
    }

    // 移除上次选择图层（若存在）
    if (this.mapApp.findLayerById('RGLayer')) {
      this.mapApp.removeLayerById('RGLayer')
    }
    this.renderGraphicLayer = new GraphicsLayer({
      graphics: graphics,
      listMode: 'hide'
    })
    this.renderGraphicLayer.id = 'RGLayer'
    this.mapApp.map.add(this.renderGraphicLayer) // 数据量过大无法完全展示
  }
  createQueryTask(url: string, data: object) {
    let options = {
      body: data,
      timeout: 180000,
      method: 'post',
      responseType: 'json'
    }
    return esriRequest(url, options)
  }
  createQueryTask2(url: string, data: object) {
    let options = {
      body: data,
      timeout: 180000,
      method: 'post',
      responseType: 'document',
      // useProxy: this.mapApp.httpProxy.useProxy,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    return esriRequest(urlUtils.addProxy(url).trim(), options)
  }
}
