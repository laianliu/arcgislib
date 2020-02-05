import Legend from 'esri/widgets/Legend'
import Compass from './widgets/Compass'
import Home from './widgets/Home'
import Fullscreen from './widgets/Fullscreen'
import Sketch from './widgets/Sketch'
import Measurement2D from './widgets/Measurement2D'
import Coordinate from './widgets/Coordinate'
import ScaleBar from './widgets/ScaleBar'
import Draw from './widgets/Draw'
import Buffer from './widgets/Buffer'
import LayerList from './widgets/LayerList'
import MyLegend from './widgets/Legend'
import BasemapGallery from './widgets/BasemapGallery'
const widgetMap = {
  Compass: Compass,
  Home: Home,
  Fullscreen: Fullscreen,
  Sketch: Sketch,
  Measurement2D: Measurement2D,
  Coordinate: Coordinate,
  ScaleBar: ScaleBar,
  Draw: Draw,
  Buffer: Buffer,
  LayerList: LayerList,
  Legend: MyLegend,
  BasemapGallery: BasemapGallery
}
export function createWidget(
  name: string,
  view: {},
  position: {},
  index: number
) {
  return new widgetMap[name](view, position, index)
}
export function createLegend(view: {}, container: {}) {
  const instance = new Legend({
    view: view,
    style: 'classic',
    layout: 'side-by-side',
    container: container
  })
  return instance
}
