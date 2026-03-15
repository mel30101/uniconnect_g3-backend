const IGroupRequestRepository = require('../../domain/repositories/IGroupRequestRepository');
const admin = require('firebase-admin');

class FirestoreGroupRequestRepository extends IGroupRequestRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  async findPendingByGroupId(groupId) {
    const snapshot = await this.db.collection('groups').doc(groupId)
      .collection('requests')
      .where('status', '==', 'pending')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findByGroupAndUser(groupId, userId) {
    const doc = await this.db.collection('groups').doc(groupId)
      .collection('requests').doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async create(groupId, userId, requestData) {
    await this.db.collection('groups').doc(groupId)
      .collection('requests').doc(userId)
      .set({
        userId: requestData.userId,
        userName: requestData.userName,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
  }

  async updateStatus(groupId, userId, status) {
    await this.db.collection('groups').doc(groupId)
      .collection('requests').doc(userId)
      .update({ status });
  }
}

module.exports = FirestoreGroupRequestRepository;
