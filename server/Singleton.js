class Singleton {
  constructor() {
    if (Singleton._instance === null) {
      Singleton._instance = this;
    }
    return Singleton._instance;
  }

  static GetInstance() {
    if (Singleton._instance === null) {
      Singleton._instance = new this();
    }
    return Singleton._instance;
  }
}

Singleton._instance = null;

export default Singleton;
