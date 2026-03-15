const IEventRepository = require('../../domain/repositories/IEventRepository');

class FirestoreEventRepository extends IEventRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  async findAll() {
    const snapshot = await this.db.collection('events').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = FirestoreEventRepository;
