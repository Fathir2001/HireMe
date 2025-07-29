# 🧪 AI-Powered Service Recommendations Testing Guide

This comprehensive guide will walk you through testing the AI-Powered Service Recommendations & Predictive Maintenance feature step by step.

## 🚀 Quick Start Testing

### 1. **Seed the Database with AI Data**

```bash
cd d:\Projects\HireMe\Back-End
node src/scripts/seedDatabase.js
```

**Expected Output:**

```
✅ Service Needers: 50
✅ Approved Providers: 100
✅ Service Requests: 200
🤖 AI Service Recommendations: 150-250
⚙️ User Preferences: 50
```

### 2. **Start the Backend Server**

```bash
cd d:\Projects\HireMe\Back-End
npm run dev
```

**Expected Output:**

```
Server is running on port 5000
MongoDB connected successfully
✅ Email configuration verified successfully
🤖 AI Recommendation System: Cron jobs scheduled
```

### 3. **Start the Frontend**

```bash
cd d:\Projects\HireMe
npm run dev
```

**Expected Output:**

```
Local:   http://localhost:5173/
```

## 📱 Frontend Testing Scenarios

### **Test 1: AI Recommendations Dashboard**

1. **Navigate to:** `http://localhost:5173/service-needer/ai-recommendations`

2. **Expected Elements:**

   - 🎯 Header with "AI-Powered Service Recommendations"
   - 📊 Filter controls (Priority, Service Type, Date Range)
   - 🎨 Recommendation cards with:
     - Service type and priority badges
     - Confidence scores (65-95%)
     - Reasoning explanations
     - Action buttons (Book Now, Dismiss, Remind Later)

3. **Test Interactions:**

   ```
   ✅ Filter by Priority: urgent, high, medium, low
   ✅ Filter by Service Type: Electrical, Plumbing, HVAC, etc.
   ✅ Click "Book Now" → Should redirect to booking page
   ✅ Click "Dismiss" → Card should fade out
   ✅ Click "Remind Later" → Should show success message
   ```

4. **Expected Data Types:**
   - **Predictive Maintenance**: "Your HVAC system shows signs of wear..."
   - **Seasonal**: "Winter is approaching - heating system maintenance..."
   - **Usage-Based**: "You typically book plumbing services every 6 months..."
   - **Emergency Prevention**: "Potential electrical hazard detected..."

### **Test 2: Smart Notifications**

1. **Auto-Detection Test:**

   - Notifications should appear automatically for urgent recommendations
   - Look for popup in top-right corner
   - Should show urgent recommendations only

2. **Test Interactions:**
   ```
   ✅ Click "View Details" → Navigate to recommendations page
   ✅ Click "Dismiss" → Notification should disappear
   ✅ Click "X" → Close notification
   ✅ Multiple notifications → Should stack properly
   ```

### **Test 3: User Preferences Configuration**

1. **Navigate to:** `http://localhost:5173/service-needer/ai-preferences`

2. **Test All 4 Tabs:**

   **Tab 1: Service Preferences**

   ```
   ✅ Service cards for all service types
   ✅ Importance sliders (1-5)
   ✅ Frequency dropdowns (weekly, monthly, quarterly, yearly)
   ✅ Budget range inputs (min/max)
   ```

   **Tab 2: Home Profile**

   ```
   ✅ Home type dropdown
   ✅ Home age input
   ✅ Home size input
   ✅ Number of occupants
   ✅ Location selection
   ```

   **Tab 3: Behavior Settings**

   ```
   ✅ Proactive recommendations toggle
   ✅ Seasonal reminders toggle
   ✅ Budget optimization toggle
   ✅ Risk alerts toggle
   ```

   **Tab 4: Notifications**

   ```
   ✅ Email notifications checkbox
   ✅ SMS notifications checkbox
   ✅ Push notifications checkbox
   ✅ Frequency dropdown
   ✅ Urgent only checkbox
   ✅ Advance notice input
   ```

3. **Save Functionality:**
   ```
   ✅ Click "Save Preferences" → Success message
   ✅ Reload page → Settings should persist
   ✅ Change tabs → No data loss
   ```

## 🔧 Backend API Testing

### **Test API Endpoints with Postman/curl**

#### **1. Get User Recommendations**

```bash
curl -X GET "http://localhost:5000/api/ai-recommendations/user/[USER_ID]"
```

**Expected Response:**

```json
{
  "success": true,
  "recommendations": [
    {
      "_id": "...",
      "serviceType": "Electrical Work",
      "recommendationType": "emergency_prevention",
      "confidence": 0.92,
      "priority": "urgent",
      "reasoning": "Potential electrical hazard detected...",
      "estimatedCost": { "min": 150, "max": 300 }
    }
  ]
}
```

#### **2. Generate New Recommendations**

```bash
curl -X POST "http://localhost:5000/api/ai-recommendations/generate"
```

#### **3. Get User Preferences**

```bash
curl -X GET "http://localhost:5000/api/ai-recommendations/preferences/[USER_ID]"
```

#### **4. Update User Preferences**

```bash
curl -X PUT "http://localhost:5000/api/ai-recommendations/preferences/[USER_ID]" \
-H "Content-Type: application/json" \
-d '{
  "servicePreferences": {
    "ElectricalWork": {
      "importance": 5,
      "frequency": "quarterly",
      "budgetRange": { "min": 100, "max": 500 }
    }
  }
}'
```

## 🤖 AI Algorithm Testing

### **Test Recommendation Types**

1. **Predictive Maintenance Logic:**

   ```javascript
   // Should consider:
   - Service history patterns
   - Equipment age
   - Usage frequency
   - Maintenance schedules
   ```

2. **Seasonal Recommendations:**

   ```javascript
   // Should factor in:
   - Current date/season
   - Weather patterns
   - Historical seasonal needs
   - Geographic location
   ```

3. **Usage-Based Learning:**

   ```javascript
   // Should analyze:
   - User booking history
   - Service preferences
   - Timing patterns
   - Provider preferences
   ```

4. **Emergency Prevention:**
   ```javascript
   // Should detect:
   - Safety risks
   - Equipment failures
   - Urgent maintenance needs
   - Compliance requirements
   ```

## ⚡ Automation Testing

### **Test Cron Jobs**

1. **Daily Recommendation Generation:**

   ```bash
   # Should run at 9:00 AM daily
   # Check logs for: "Daily recommendations generated for X users"
   ```

2. **Reminder Notifications:**

   ```bash
   # Should send reminders for pending recommendations
   # Check logs for: "Reminder notifications sent: X"
   ```

3. **Data Cleanup:**
   ```bash
   # Should remove old recommendations
   # Check logs for: "Cleaned up X old recommendations"
   ```

## 📊 Database Testing

### **Verify Data Models**

1. **ServiceRecommendation Collection:**

   ```javascript
   // Check MongoDB for:
   db.servicerecommendations.find().limit(5)

   // Should contain:
   - userId (ObjectId)
   - serviceType (String)
   - recommendationType (enum)
   - confidence (Number 0-1)
   - priority (urgent/high/medium/low)
   - reasoning (String)
   - suggestedDate (Date)
   - estimatedCost (Object)
   - status (active/dismissed/booked)
   ```

2. **UserPreference Collection:**

   ```javascript
   db.userpreferences.find().limit(5) -
     // Should contain:
     userId(ObjectId) -
     servicePreferences(Object) -
     homeProfile(Object) -
     behaviorSettings(Object) -
     notificationPreferences(Object);
   ```

## 🔍 Integration Testing

### **End-to-End User Flow**

1. **Complete User Journey:**

   ```
   ✅ User logs in as Service Needer
   ✅ Views AI recommendations dashboard
   ✅ Sees personalized recommendations
   ✅ Configures preferences
   ✅ Takes action on recommendation
   ✅ Receives notifications
   ✅ Books service based on recommendation
   ```

2. **Cross-Component Integration:**
   ```
   ✅ Recommendations → Booking flow
   ✅ Preferences → Recommendation filtering
   ✅ Notifications → Action handling
   ✅ API → Frontend data flow
   ```

## 🐛 Common Testing Issues & Solutions

### **Issue 1: No Recommendations Showing**

```
Problem: Empty recommendation list
Solution:
1. Check if seeded data exists
2. Verify API endpoint returns data
3. Check user ID in localStorage/session
```

### **Issue 2: Preferences Not Saving**

```
Problem: Settings reset after page reload
Solution:
1. Check API PUT request in network tab
2. Verify database connection
3. Check user authentication
```

### **Issue 3: Notifications Not Appearing**

```
Problem: No popup notifications
Solution:
1. Check for urgent priority recommendations
2. Verify notification component mounting
3. Check browser console for errors
```

### **Issue 4: Cron Jobs Not Running**

```
Problem: No automated recommendations
Solution:
1. Check server logs for cron job messages
2. Verify cron package installation
3. Check system timezone settings
```

## 📈 Performance Testing

### **Load Testing Scenarios**

1. **Multiple Users:**

   ```bash
   # Test with 50+ users simultaneously accessing recommendations
   # Monitor response times and server performance
   ```

2. **Large Dataset:**

   ```bash
   # Generate 1000+ recommendations
   # Test filtering and pagination performance
   ```

3. **Concurrent API Calls:**
   ```bash
   # Multiple simultaneous API requests
   # Verify no race conditions or data corruption
   ```

## ✅ Test Completion Checklist

### **Frontend Testing**

- [ ] AI Recommendations dashboard loads correctly
- [ ] All recommendation types display properly
- [ ] Filtering works for all criteria
- [ ] Action buttons function correctly
- [ ] Smart notifications appear for urgent items
- [ ] Preferences interface saves/loads data
- [ ] All 4 preference tabs work properly
- [ ] Responsive design works on mobile

### **Backend Testing**

- [ ] All API endpoints respond correctly
- [ ] Database models store data properly
- [ ] AI algorithms generate diverse recommendations
- [ ] Cron jobs execute on schedule
- [ ] Error handling works for invalid requests
- [ ] Authentication protects endpoints

### **Integration Testing**

- [ ] Frontend-backend communication works
- [ ] Database operations complete successfully
- [ ] Real-time notifications function
- [ ] User preferences affect recommendations
- [ ] End-to-end user flow works seamlessly

### **Performance Testing**

- [ ] Page load times under 3 seconds
- [ ] API responses under 500ms
- [ ] No memory leaks in long sessions
- [ ] Smooth user interactions

## 🎯 Success Criteria

**The AI feature is working correctly when:**

1. ✅ Users see 2-5 personalized recommendations
2. ✅ Recommendations include all 4 types (predictive, seasonal, usage-based, emergency)
3. ✅ Confidence scores range from 65-95%
4. ✅ Priority levels are correctly assigned
5. ✅ User preferences affect recommendation content
6. ✅ Notifications appear for urgent recommendations
7. ✅ All user actions (book, dismiss, remind) work properly
8. ✅ Settings persist across sessions
9. ✅ Cron jobs generate daily recommendations
10. ✅ System scales with multiple users

---

**🎉 Once all tests pass, your AI-Powered Service Recommendations system is ready for production!**
