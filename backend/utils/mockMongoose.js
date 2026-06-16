import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

function loadDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({
      User: [],
      Product: [],
      Order: [],
      Inventory: [],
      Coupon: [],
      Feedback: [],
      Customer: []
    }, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (err) {
    return {
      User: [],
      Product: [],
      Order: [],
      Inventory: [],
      Coupon: [],
      Feedback: [],
      Customer: []
    };
  }
}

function saveDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const Schema = function(definition, options) {
  if (!(this instanceof Schema)) {
    return new Schema(definition, options);
  }
  this.definition = definition;
  this.options = options;
  this.methods = {};
  this.preHooks = [];
  this.pre = function(event, callback) {
    if (event === 'save') {
      this.preHooks.push(callback);
    }
  };
  this.index = function() {};
};

Schema.Types = {
  ObjectId: String,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Date: Date,
};

function createMockModel(modelName, schema) {
  class MockDocument {
    constructor(data = {}) {
      const definition = schema.definition || {};
      for (const [key, value] of Object.entries(definition)) {
        if (data[key] !== undefined) {
          this[key] = data[key];
        } else {
          if (value && typeof value === 'object' && value.default !== undefined) {
            if (typeof value.default === 'function') {
              this[key] = value.default();
            } else {
              this[key] = value.default;
            }
          }
        }
      }

      Object.assign(this, data);

      if (schema.methods) {
        for (const [methodName, fn] of Object.entries(schema.methods)) {
          this[methodName] = fn.bind(this);
        }
      }

      this.isModified = function(field) {
        return true;
      };

      this.deleteOne = async function() {
        const db = loadDb();
        db[modelName] = (db[modelName] || []).filter(item => item._id !== this._id);
        saveDb(db);
        return { deletedCount: 1 };
      };
    }

    async save() {
      if (schema.preHooks && schema.preHooks.length > 0) {
        for (const hook of schema.preHooks) {
          await new Promise((resolve, reject) => {
            let called = false;
            const next = (err) => {
              if (called) return;
              called = true;
              if (err) reject(err);
              else resolve();
            };
            try {
              const p = hook.call(this, next);
              if (p && typeof p.then === 'function') {
                p.then(() => {
                  if (!called) {
                    called = true;
                    resolve();
                  }
                }).catch(err => {
                  if (!called) {
                    called = true;
                    reject(err);
                  }
                });
              }
            } catch (err) {
              if (!called) {
                called = true;
                reject(err);
              }
            }
          });
        }
      }

      const db = loadDb();
      if (!db[modelName]) {
        db[modelName] = [];
      }

      if (!this._id) {
        this._id = Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        db[modelName].push(JSON.parse(JSON.stringify(this)));
      } else {
        this.updatedAt = new Date().toISOString();
        const index = db[modelName].findIndex(item => item._id === this._id);
        if (index !== -1) {
          db[modelName][index] = JSON.parse(JSON.stringify(this));
        } else {
          db[modelName].push(JSON.parse(JSON.stringify(this)));
        }
      }
      saveDb(db);
      return this;
    }
  }

  MockDocument.modelName = modelName;

  MockDocument.find = function(query = {}) {
    const db = loadDb();
    let results = db[modelName] || [];

    results = results.filter(item => {
      for (const [key, val] of Object.entries(query)) {
        if (key === '$or') {
          const matchesAny = val.some(subQuery => {
            return Object.entries(subQuery).every(([subKey, subVal]) => {
              const itemVal = item[subKey] || '';
              if (subVal && typeof subVal === 'object' && subVal.$regex) {
                const regex = new RegExp(subVal.$regex, subVal.$options || '');
                return regex.test(itemVal);
              }
              return itemVal === subVal;
            });
          });
          if (!matchesAny) return false;
          continue;
        }

        const itemVal = item[key];
        if (val && typeof val === 'object') {
          if (val.$regex) {
            const regex = new RegExp(val.$regex, val.$options || '');
            return regex.test(itemVal || '');
          }
          if (val.$gte !== undefined || val.$lte !== undefined) {
            const dateVal = new Date(itemVal);
            if (val.$gte && dateVal < new Date(val.$gte)) return false;
            if (val.$lte && dateVal > new Date(val.$lte)) return false;
            continue;
          }
          if (val.$inc !== undefined) {
            continue;
          }
        }
        if (val !== undefined && itemVal !== val) {
          return false;
        }
      }
      return true;
    }).map(item => new MockDocument(item));

    const queryChain = {
      results: results,
      then: function(resolve, reject) {
        return Promise.resolve(this.results).then(resolve, reject);
      },
      sort: function(sortArg) {
        if (sortArg && typeof sortArg === 'object') {
          const [field, direction] = Object.entries(sortArg)[0];
          this.results.sort((a, b) => {
            let valA = a[field] !== undefined ? a[field] : '';
            let valB = b[field] !== undefined ? b[field] : '';
            if (typeof valA === 'string') {
              return direction === 1 ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return direction === 1 ? valA - valB : valB - valA;
          });
        }
        return this;
      },
      limit: function(num) {
        this.results = this.results.slice(0, num);
        return this;
      },
      select: function(selectArg) {
        return this;
      },
      populate: function(populateArg) {
        const pathString = typeof populateArg === 'string' ? populateArg : populateArg?.path || '';
        if (modelName === 'Order' && pathString.includes('orderItems.product')) {
          const productsDb = loadDb().Product || [];
          this.results.forEach(order => {
            if (order.orderItems) {
              order.orderItems.forEach(item => {
                const prodVal = item.product;
                const prodId = typeof prodVal === 'object' && prodVal !== null ? prodVal._id || prodVal : prodVal;
                if (typeof prodId === 'string') {
                  const p = productsDb.find(p => p._id === prodId);
                  if (p) {
                    item.product = p;
                  }
                }
              });
            }
          });
        }
        return this;
      }
    };

    queryChain.catch = function(reject) {
      return Promise.resolve(this.results).catch(reject);
    };

    return queryChain;
  };

  MockDocument.findOne = function(query = {}) {
    const queryChain = MockDocument.find(query);
    
    const originalThen = queryChain.then;
    queryChain.then = function(resolve, reject) {
      return Promise.resolve(queryChain.results[0] || null).then(resolve, reject);
    };

    const originalPopulate = queryChain.populate;
    queryChain.populate = function(populateArg) {
      originalPopulate.call(queryChain, populateArg);
      return this;
    };

    return queryChain;
  };

  MockDocument.findById = function(id) {
    if (typeof id === 'object' && id !== null) id = id.toString();
    return MockDocument.findOne({ _id: id });
  };

  MockDocument.findByIdAndUpdate = async function(id, update, options = {}) {
    if (typeof id === 'object' && id !== null) id = id.toString();
    const doc = await MockDocument.findById(id);
    if (!doc) return null;

    if (update.$inc) {
      for (const [field, incVal] of Object.entries(update.$inc)) {
        doc[field] = (doc[field] || 0) + incVal;
      }
    }

    const fieldsToUpdate = update.$set || update;
    for (const [key, val] of Object.entries(fieldsToUpdate)) {
      if (key !== '$inc' && key !== '$set') {
        doc[key] = val;
      }
    }

    await doc.save();
    return doc;
  };

  MockDocument.findByIdAndDelete = async function(id) {
    if (typeof id === 'object' && id !== null) id = id.toString();
    const doc = await MockDocument.findById(id);
    if (doc) {
      await doc.deleteOne();
      return doc;
    }
    return null;
  };

  MockDocument.countDocuments = async function(query = {}) {
    const chain = MockDocument.find(query);
    return chain.results.length;
  };

  MockDocument.insertMany = async function(arr) {
    const savedDocs = [];
    for (const item of arr) {
      const doc = new MockDocument(item);
      await doc.save();
      savedDocs.push(doc);
    }
    return savedDocs;
  };

  MockDocument.create = async function(data) {
    const doc = new MockDocument(data);
    await doc.save();
    return doc;
  };

  MockDocument.deleteMany = async function(query = {}) {
    const db = loadDb();
    if (Object.keys(query).length === 0) {
      db[modelName] = [];
    } else {
      const chain = MockDocument.find(query);
      const idsToDelete = chain.results.map(r => r._id);
      db[modelName] = (db[modelName] || []).filter(item => !idsToDelete.includes(item._id));
    }
    saveDb(db);
    return { deletedCount: db[modelName].length };
  };

  return MockDocument;
}

const mongooseMock = {
  Schema: Schema,
  model: function(modelName, schema) {
    return createMockModel(modelName, schema);
  },
  connect: async function() {
    console.log('Mock MongoDB Connected Successfully!');
    return true;
  },
  connection: {
    on: () => {},
    once: () => {},
  }
};

export default mongooseMock;
export { Schema };
