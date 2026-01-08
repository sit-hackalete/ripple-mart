# Testing Guide: DID Onboarding Flow

## Prerequisites

Before testing, ensure you have:

1. ✅ **Next.js dev server running**
   ```bash
   npm run dev
   ```

2. ✅ **Environment variables configured** (`.env.local`):
   ```env
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=ripple_mart
   PINATA_JWT=your_pinata_jwt_token
   ```

3. ✅ **Crossmark wallet extension installed**
   - Install from [Chrome Web Store](https://chrome.google.com/webstore/detail/crossmark/khghbkmeeopmepgjojkmnlenmepfmhij)
   - Create or import a test wallet
   - Fund it with test XRP (for testnet) or real XRP (for mainnet)

4. ✅ **MongoDB running** (local or Atlas)

## Step-by-Step Testing

### Step 1: Access the DID Page

1. Open your browser and navigate to: `http://localhost:3000/did`
   - Or click "DID Onboarding" in the navigation menu

2. **Expected**: You should see a page asking you to connect your wallet

### Step 2: Connect Wallet

1. Click "Connect Crossmark" button (top right)
2. Crossmark extension should open
3. Approve the connection request
4. **Expected**: 
   - Wallet address appears in the top right
   - DID page shows "Phase 1: Publish DID Document" section

### Step 3: Test Phase 1 - Publish DID

1. Click the **"Publish DID Document"** button
2. **Expected behavior**:
   - Button shows "Publishing..." state
   - After a few seconds, you should see:
     - ✅ Green checkmark on Phase 1
     - DID information displayed:
       - DID: `did:xrpl:rYourWalletAddress...`
       - CID: `Qm...` (IPFS hash)
       - IPFS URI: `ipfs://Qm...`
       - Gateway URL (clickable link)

3. **Verify in MongoDB**:
   ```javascript
   // In MongoDB Compass or shell
   db.merchants.findOne({ _id: "rYourWalletAddress" })
   // Should show:
   // - didStatus: "did_ready"
   // - didCid, didIpfsUri, didGatewayUrl fields populated
   ```

4. **Verify IPFS**:
   - Click the Gateway URL link
   - Should open and display the DID Document JSON
   - Should show your wallet address in the `id` field

### Step 4: Test Phase 2 - Anchor DID

1. After Phase 1 completes, you should see:
   - Phase 2 section enabled
   - "Anchor DID on XRPL" button available

2. Click **"Anchor DID on XRPL"** button

3. **Expected behavior**:
   - Crossmark extension opens
   - Shows a DIDSet transaction to sign
   - Transaction details:
     - Transaction Type: DIDSet
     - Account: Your wallet address
     - URI: Hex-encoded IPFS URI

4. **Approve the transaction** in Crossmark

5. **Expected after signing**:
   - Button shows "Anchoring DID..." briefly
   - Success alert: "DID successfully anchored on XRPL!"
   - Transaction hash displayed
   - Phase 2 shows ✅ "Anchored" status
   - Transaction hash is a clickable link to XRPL Explorer

6. **Verify in MongoDB**:
   ```javascript
   db.merchants.findOne({ _id: "rYourWalletAddress" })
   // Should show:
   // - didStatus: "anchored_on_xrpl"
   // - didAnchoredTxHash: "transaction_hash_here"
   // - didAnchoredAt: ISODate timestamp
   ```

7. **Verify on XRPL**:
   - Click the transaction hash link
   - Should open XRPL Explorer showing your DIDSet transaction
   - Transaction should be confirmed/validated

## Testing Edge Cases

### Test 1: Re-visit After Publishing
1. Publish DID (Phase 1)
2. Refresh the page
3. **Expected**: Status should persist, showing "did_ready"

### Test 2: Re-visit After Anchoring
1. Complete both phases
2. Refresh the page
3. **Expected**: Both phases show complete, transaction hash visible

### Test 3: Test Without Wallet
1. Disconnect wallet
2. Navigate to `/did`
3. **Expected**: Shows message to connect wallet first

### Test 4: Test API Endpoints Directly

#### Test Publish Endpoint:
```bash
# PowerShell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3000/api/did/publish" `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"xrplAccount":"rYourWalletAddress"}'
```

**Expected**: Returns JSON with `did`, `cid`, `ipfsUri`, `gatewayUrl`, `status: "did_ready"`

#### Test Anchor Status Endpoint:
```bash
Invoke-RestMethod `
  -Method GET `
  -Uri "http://localhost:3000/api/did/anchor?walletAddress=rYourWalletAddress"
```

**Expected**: Returns current DID status

#### Test Resolve Endpoint:
```bash
Invoke-RestMethod `
  -Method GET `
  -Uri "http://localhost:3000/api/did/resolve?cid=QmYourCID"
```

**Expected**: Returns resolved DID document

## Troubleshooting

### Issue: "Missing PINATA_JWT"
- **Solution**: Add `PINATA_JWT` to `.env.local` and restart dev server

### Issue: "Crossmark wallet not found"
- **Solution**: Install Crossmark extension and refresh page

### Issue: Transaction fails to sign
- **Check**: Wallet has enough XRP for transaction fees
- **Check**: Network is correct (testnet vs mainnet)
- **Check**: Browser console for error messages

### Issue: MongoDB save fails
- **Check**: MongoDB connection string is correct
- **Check**: MongoDB is running
- **Note**: DID is still published to IPFS even if DB save fails

### Issue: IPFS gateway timeout
- **Check**: Custom gateway URL in `.env.local` (if using)
- **Note**: Public gateways may be slow, code has retry logic

## Success Criteria

✅ **Phase 1 Complete** when:
- DID Document published to IPFS
- MongoDB shows `didStatus: "did_ready"`
- Gateway URL returns valid DID Document

✅ **Phase 2 Complete** when:
- DIDSet transaction signed and submitted
- Transaction hash recorded in MongoDB
- MongoDB shows `didStatus: "anchored_on_xrpl"`
- Transaction visible on XRPL Explorer

## Next Steps After Testing

Once testing is complete:
1. ✅ Verify DID can be resolved via `/api/did/resolve?cid=...`
2. ✅ Check transaction on XRPL Explorer
3. ✅ Verify MongoDB has all fields populated correctly
4. ✅ Test with different wallet addresses
5. ✅ Test error scenarios (reject transaction, network issues, etc.)
