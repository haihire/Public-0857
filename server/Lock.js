import { Mutex } from "async-mutex";

export default class Lock {
  constructor() {
    this.mutexMap = new Map(); // ID별로 Mutex를 저장할 Map 객체
  }

  async lockAndExecute(sUserID, callback) {
    if (!this.mutexMap.has(sUserID)) {
      this.mutexMap.set(sUserID, new Mutex());
    }
    const mutex = this.mutexMap.get(sUserID);

    const release = await mutex.acquire();
    try {
      await callback();
    } finally {
      release();
      if (!mutex.isLocked()) {
        this.mutexMap.delete(sUserID); // 작업 완료 후 Mutex 삭제
      }
    }
  }
}
