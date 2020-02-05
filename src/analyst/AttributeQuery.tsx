import Query from 'esri/tasks/support/Query'
import QueryTask from 'esri/tasks/QueryTask'
export default class AttributeQuery {
  constructor(mapApp: object, layerId: string, extent: object) {
    this.layerId = layerId
    this.extent = extent
    this.mapApp = mapApp
    this.layer = mapApp ? mapApp.findLayerById(this.layerId) : null
    this.maxRecordCount = 1000 // 每次最大查询数
    this.paginationCount = 0 // 分批查询次数
    this.startIndex = 0
  }
  startQuery() {
    let me = this
    me.layer = this.mapApp ? this.mapApp.findLayerById(me.layerId) : null
    me._queryCount(me.extent).then(function(count) {
      console.log('一共有' + count + '条记录')
      if (count <= me.maxRecordCount) {
        me._queryAttributes(me.extent).then(function(results) {
          this.mapApp.res['' + me.layerId] = results.features.reduce(function(
            arr,
            cur
          ) {
            arr.concat(cur.attributes)
          },
          [])
        })
      } else {
        me.paginationCount = Math.ceil(count / me.maxRecordCount)
        var promiseArray = []
        for (let i = 0; i < me.paginationCount; i += 1) {
          me.startIndex = i * me.maxRecordCount
          promiseArray.push(
            me._queryAttributes(me.extent).then(function(result) {
              return result
            })
          )
        }
        Promise.all(promiseArray)
          .then(function(result) {
            this.mapApp.res = []
            result = result
              .reduce(function(arr, cur) {
                arr.push(cur.features)
                return arr
              }, [])
              .reduce(function(arr, cur) {
                arr.concat(cur)
              }, [])
            result.forEach(function(e) {
              this.mapApp.res['' + me.layerId].push(e.attributes)
            })
          })
          .catch(function(err) {
            console.error(err)
          })
      }
    })
  }

  doQuery() {
    let task = new QueryTask({
      url: layerURL
    })
    let query = new Query({
      outFields: ['*'],
      returnGeometry: true,
      where: where
    })
    return task.execute(query)
  }
  _doQuery() {
    let queryUrl = this.layer.url + '/0'
    let task = new QueryTask({
      url: queryUrl
    })
    let query = new Query()
    return { task: task, query: query }
  }
  _queryCount() {
    let foo = this._doQuery()
    foo.query.outFields = ['*']
    foo.query.where = '1=1'
    foo.query.returnGeometry = false
    foo.query.geometry = this.extent
    return foo.task.executeForCount(foo.query)
  }

  _queryAttributes() {
    let foo = this._doQuery()
    foo.query.outFields = ['*']
    foo.query.geometry = this.extent
    foo.query.returnGeometry = false
    // foo.query.where = "FID >= " + this.startIndex || 0; // 自己发布的服务要用FID
    return foo.task.execute(foo.query)
  }
}
