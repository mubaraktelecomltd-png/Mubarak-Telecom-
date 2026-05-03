# Security Specification - Mubarak Telecom

## Data Invariants
- A `Transaction` must always be associated with a valid `userId`.
- Users can only read their own user profile and transactions.
- `Offers` are read-only for all authenticated users but writeable only by admins.
- User `balance` and `level` should ideally be server-managed, but for this demo, we'll implement rules to prevent users from modifying their own balance/level unless they're an admin.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: User A trying to read User B's profile.
2. **Identity Spoofing**: User A trying to create a transaction for User B.
3. **Privilege Escalation**: User trying to update their own `level` to 'admin' or 'vip-parent'.
4. **Balance Manipulation**: User trying to increase their own `balance` via `update`.
5. **Offer Modification**: User trying to change the price of an `Offer`.
6. **Offer Creation**: User trying to create a new `Offer`.
7. **Invalid ID**: Creating a transaction with an ID containing malicious symbols.
8. **Shadow Field**: Adding `isVerified: true` to a profile update.
9. **Timestamp Spoofing**: Setting a future `createdAt` date on a transaction.
10. **Resource Exhaustion**: Sending a 1MB string as a transaction status.
11. **Unauthorized List**: Trying to list all `users` in the system.
12. **Status Skipping**: User trying to update a transaction status from `pending` to `success` directly.

## The Test Runner (firestore.rules.test.ts placeholder)
We will ensure that `firestore.rules` handles these cases by strictly validating `request.auth.uid` and using `affectedKeys().hasOnly()`.
