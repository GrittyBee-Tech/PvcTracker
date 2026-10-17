# Database Migration Verification Queries (MongoDB Shell / mongosh)

This document contains exact MongoDB queries to verify data parity, validate unique index consistency, confirm zero unmigrated documents, and ensure sparse indexing rules are strictly respected after running `migrate_nin_vin.ts`.

---

## 1. Migration Progress & Overall Document Counts

Run these counts to establish baseline parity between plaintext and encrypted representations:

```javascript
// 1.1 Total users count
db.users.countDocuments({});

// 1.2 Count of records with legacy plaintext NIN vs encrypted/hashed NIN
const totalPlaintextNIN = db.users.countDocuments({
  nin: { $exists: true, $type: "string", $ne: "" }
});
const totalEncryptedNIN = db.users.countDocuments({
  ninEncrypted: { $exists: true, $type: "string", $ne: "" },
  ninHash: { $exists: true, $type: "string", $ne: "" }
});
print(`Plaintext NINs: ${totalPlaintextNIN} | Encrypted/Hashed NINs: ${totalEncryptedNIN}`);

// 1.3 Count of records with legacy plaintext VIN vs encrypted/hashed VIN
const totalPlaintextVIN = db.users.countDocuments({
  vin: { $exists: true, $type: "string", $ne: "" }
});
const totalEncryptedVIN = db.users.countDocuments({
  vinEncrypted: { $exists: true, $type: "string", $ne: "" },
  vinHash: { $exists: true, $type: "string", $ne: "" }
});
print(`Plaintext VINs: ${totalPlaintextVIN} | Encrypted/Hashed VINs: ${totalEncryptedVIN}`);
```

---

## 2. Check for Unmigrated Documents

These queries MUST return `0` before proceeding to disable legacy dual-write:

```javascript
// 2.1 Documents with a plaintext NIN that lack ninEncrypted or ninHash
db.users.find({
  nin: { $exists: true, $type: "string", $ne: "" },
  $or: [
    { ninEncrypted: { $exists: false } },
    { ninEncrypted: null },
    { ninHash: { $exists: false } },
    { ninHash: null }
  ]
}).count();

// 2.2 Documents with a plaintext VIN that lack vinEncrypted or vinHash
db.users.find({
  vin: { $exists: true, $type: "string", $ne: "" },
  $or: [
    { vinEncrypted: { $exists: false } },
    { vinEncrypted: null },
    { vinHash: { $exists: false } },
    { vinHash: null }
  ]
}).count();
```

---

## 3. Sparse Unique Index Constraint Validation (Zero-Null Rule)

In MongoDB, a `sparse` index still indexes documents where the field value is explicitly `null`. To prevent `E11000 duplicate key error` on `null`, documents without a VIN must have the `vinHash` field completely absent (unset), never set to `null` or empty string `""`.

```javascript
// 3.1 Verify NO documents contain literal null or empty string for vinHash
db.users.find({
  $or: [
    { vinHash: null },
    { vinHash: "" }
  ]
}).count(); // MUST RETURN 0

// 3.2 Verify NO documents contain literal null or empty string for ninHash
db.users.find({
  $or: [
    { ninHash: null },
    { ninHash: "" }
  ]
}).count(); // MUST RETURN 0

// 3.3 Verify documents without a plaintext VIN have NO vinHash or vinEncrypted fields
db.users.find({
  $or: [
    { vin: { $exists: false } },
    { vin: null },
    { vin: "" }
  ],
  $or: [
    { vinHash: { $exists: true } },
    { vinEncrypted: { $exists: true } }
  ]
}).count(); // MUST RETURN 0
```

---

## 4. Quarantine & Error Audit

Verify if any documents failed during migration due to pre-existing data corruption or unique constraint collisions:

```javascript
// 4.1 Check for quarantined/failed migration records
db.users.find(
  { migrationStatus: "failed" },
  { _id: 1, email: 1, nin: 1, vin: 1, migrationError: 1, migrationAttemptedAt: 1 }
).pretty();
```

---

## 5. Index Verification

Ensure the new partial-filter unique indexes are created and active:

```javascript
// List all indexes on the users collection
db.users.getIndexes();
```
