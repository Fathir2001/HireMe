# Database Seeding Instructions

## Overview

This script will populate your HireMe database with comprehensive sample data for all collections (except admins and activeservices as requested).

## Data Generated

- **50 Service Needers** - Customers looking for services
- **100 Approved Service Providers** - Active service providers
- **20 Requested Service Providers** - Pending approval
- **15 Rejected Service Providers** - Previously rejected
- **200 Service Requests** - Initial service requests
- **120 Accepted Services** - Services accepted by providers
- **40 Rejected Services** - Services rejected by providers
- **84 Completed Services** - Finished services
- **36 Connected Services** - Services with OTP verification
- **200+ Notifications** - Real-time notifications
- **160+ SN Notifications** - Service needer notifications

## How to Run

### Method 1: Using npm script (Recommended)

```bash
cd Back-End
npm run seed
```

### Method 2: Direct node execution

```bash
cd Back-End
node src/scripts/seedDatabase.js
```

## Important Notes

1. **Environment Variables**: Make sure your `.env` file is properly configured with:

   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

2. **Database Connection**: The script will connect to your MongoDB database specified in the environment variables.

3. **Data Clearing**: By default, the script will clear existing data from all collections before seeding. If you want to keep existing data, comment out the clearing section in the script.

4. **Realistic Data**: All generated data includes:

   - Realistic names, emails, and phone numbers
   - Proper service types and locations
   - Historical dates for service progression
   - Appropriate relationships between collections

5. **Password**: All users (service needers and providers) will have the password `password123` for testing purposes.

## Sample Login Credentials After Seeding

### Service Needers

- Email: `john.smith0@email.com` to `john.smith49@email.com`
- Password: `password123`

### Service Providers

- Email: `approved0@email.com` to `approved99@email.com`
- Password: `password123`

## Troubleshooting

1. **Connection Error**: Ensure MongoDB is running and the connection string is correct
2. **Permission Error**: Make sure the database user has write permissions
3. **Memory Issues**: If running on limited memory, reduce the number of records in the script

## Next Steps

After seeding, you can:

1. Test the application with realistic data
2. Implement the AI-Powered Service Recommendations feature
3. Analyze service patterns and user behavior
4. Test the predictive maintenance algorithms

The seeded data includes historical service patterns that will be perfect for training the AI recommendation system!
