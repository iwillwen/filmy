import Model from 'min-model'

class ChineseStringIndexer extends Model.BaseIndexer {
  get async() { return true }

  indexMapper(val) {
    return fetch(`http://pullword.leanapp.cn/get?source=${encodeURIComponent(val)}&threshold=0.5&json=1`)
      .then(res => res.json())
      .catch(() => [ val ])
  }
}

export default ChineseStringIndexer