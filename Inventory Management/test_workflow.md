# 🧪 Test Workflow: Purchase Order → Inventory

## **📋 Complete Workflow Test**

### **Step 1: Create a Test Product**
1. Go to **Products** page
2. Click **"Add Product"**
3. Fill in the form:
   - Name: "Test iPhone 15 Pro"
   - SKU: "TEST-IP15P-001"
   - Category: Select any category
   - Cost Price: 899.00
   - Selling Price: 1099.00
   - Reorder Point: 10
   - Reorder Quantity: 50
4. Click **"Create Product"**

**Expected Result:**
- ✅ Product created
- ✅ Inventory records automatically created for all warehouses (0 stock)
- ✅ Initial Purchase Orders automatically generated

### **Step 2: Verify Automatic Inventory Creation**
1. Go to **Inventory** page
2. Search for "Test iPhone 15 Pro"
3. Verify inventory records exist for all warehouses with 0 stock

**Expected Result:**
- ✅ Inventory records created for all active warehouses
- ✅ Quantity On Hand: 0
- ✅ Status: "Out of Stock"

### **Step 3: Verify Automatic Purchase Orders**
1. Go to **Purchase Orders** page
2. Search for "Test iPhone 15 Pro"
3. Verify PO was created automatically

**Expected Result:**
- ✅ Purchase Order created with status "DRAFT"
- ✅ One PO per warehouse
- ✅ Quantity: 50 units (reorder quantity)
- ✅ Supplier: First active supplier

### **Step 4: Approve Purchase Order**
1. Find the Purchase Order for "Test iPhone 15 Pro"
2. Click **"Update Status"** button
3. Change status from "DRAFT" to "APPROVED"
4. Click **"Update Status"**

**Expected Result:**
- ✅ Status changes to "APPROVED"
- ✅ PO is ready for receipt

### **Step 5: Receive Stock**
1. Click **"Receive Items"** button on the approved PO
2. Enter received quantity (e.g., 50)
3. Add notes: "Stock received from supplier"
4. Click **"Receive Items"**

**Expected Result:**
- ✅ Status changes to "FULLY_RECEIVED"
- ✅ Inventory automatically updates
- ✅ Stock movement recorded

### **Step 6: Verify Inventory Update**
1. Go to **Inventory** page
2. Search for "Test iPhone 15 Pro"
3. Check the warehouse where you received stock

**Expected Result:**
- ✅ Quantity On Hand: 50 (was 0)
- ✅ Status: "In Stock"
- ✅ Available for sales

### **Step 7: Check Dashboard**
1. Go to **Dashboard**
2. Check the metrics

**Expected Result:**
- ✅ Total Products: Increased by 1
- ✅ Total Value: Increased by (50 × 899 = 44,950)
- ✅ Low Stock Items: May decrease if this was the only low stock item

## **🎯 Key Points to Verify:**

### **✅ Automatic Processes:**
- Product creation → Automatic inventory creation
- Product creation → Automatic PO generation
- PO approval → No inventory change (yet)
- PO receipt → Automatic inventory update
- PO receipt → Automatic stock movement recording

### **✅ Real-time Updates:**
- Dashboard metrics update immediately
- Inventory quantities update in real-time
- Stock movements are recorded with timestamps
- Audit trail is maintained

### **✅ Business Logic:**
- Only APPROVED POs can receive stock
- Cannot receive more than ordered quantity
- Inventory is updated per warehouse
- Stock movements track the complete flow

## **🔍 What to Look For:**

1. **Immediate Feedback:** All changes should be visible immediately
2. **Data Consistency:** Inventory should match received quantities
3. **Audit Trail:** All actions should be logged
4. **Status Transitions:** PO status should follow the correct workflow
5. **Dashboard Updates:** Metrics should reflect current state

## **🚨 Common Issues to Check:**

1. **Authentication:** Make sure you're logged in as ADMIN
2. **Permissions:** Verify you have access to all modules
3. **Data Integrity:** Check that quantities add up correctly
4. **Real-time Updates:** Verify dashboard refreshes automatically
5. **Error Handling:** Test with invalid data to see error messages 