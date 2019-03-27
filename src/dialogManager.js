import defaultOpt from './defaultOpt';
export class DialogManager {
  constructor () {
    this.startIndex = defaultOpt.startIndex;
    this.id = 1;
    this._cache = [];
  }
  get cache() {

  }
  addCache () {

  }
  removeCache (id) {
    id = id.replace(/^dialog([0-9]+)$/, '$1');
  }
  getIndex () {
    return this.startIndex;
  }
}

export default new DialogManager();
