import Search1 from 'esri/widgets/Search'
import Expand from 'esri/widgets/Expand'
export default class Search {
  constructor(view: object, position: object, index: number) {
    this.search = null
    this.search = new Expand({
      view: view,
      group: 'top-right',
      expandTooltip: '搜索',
      content: new Search1({
        view: view,
        sources: []
      })
    })
    view.ui.add(this.search, position)
  }
}
