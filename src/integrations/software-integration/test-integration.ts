/**
 * Test script for CRM Integration
 * 
 * Run this script to test the integration between your software and CRM
 */

import { crmIntegration, RegistrationData, ActivityData } from './CRMIntegration';

async function testCRMIntegration() {
  console.log('🧪 Testing CRM Integration...\n');

  // Test 1: Basic Registration
  console.log('1️⃣ Testing basic registration...');
  const registrationData: RegistrationData = {
    email: 'test.user@example.com',
    first_name: 'Test',
    last_name: 'User',
    phone: '+91-9876543210',
    state: 'Maharashtra',
    exam_category: 'Court Exams',
    how_did_you_hear: 'Google',
    plan: 'Trial User',
    is_trial_active: true,
    is_subscription_active: false,
    trial_start_date: new Date().toISOString(),
    trial_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    software_version: '2.1.0',
    registration_source: 'test',
    notes: 'Test registration from integration test'
  };

  try {
    const result = await crmIntegration.sendRegistration(registrationData);
    console.log(`✅ Registration test: ${result.success ? 'PASSED' : 'FAILED'}`);
    console.log(`   Action: ${result.action}, Lead ID: ${result.lead_id}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.log('❌ Registration test: FAILED');
    console.log(`   Error: ${error}`);
  }

  console.log('\n2️⃣ Testing activity update...');
  const activityData: ActivityData = {
    email: 'test.user@example.com',
    login_count: 5,
    subscription_days_left: 12,
    daily_time_spent: 45,
    total_time_spent: 180,
    last_active: new Date().toISOString()
  };

  try {
    const result = await crmIntegration.updateActivity(activityData);
    console.log(`✅ Activity test: ${result.success ? 'PASSED' : 'FAILED'}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.log('❌ Activity test: FAILED');
    console.log(`   Error: ${error}`);
  }

  console.log('\n3️⃣ Testing lead update...');
  const updateData = {
    email: 'test.user@example.com',
    status: 'Contacted',
    plan: 'Basic Monthly',
    amount_paid: 500,
    is_trial_active: false,
    is_subscription_active: true,
    subscription_plan: 'Basic Monthly',
    notes: 'User upgraded to paid plan'
  };

  try {
    const result = await crmIntegration.updateLead(updateData);
    console.log(`✅ Lead update test: ${result.success ? 'PASSED' : 'FAILED'}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.log('❌ Lead update test: FAILED');
    console.log(`   Error: ${error}`);
  }

  console.log('\n4️⃣ Testing duplicate registration (should update existing)...');
  const duplicateData: RegistrationData = {
    email: 'test.user@example.com',
    first_name: 'Test',
    last_name: 'User Updated',
    phone: '+91-9876543211',
    state: 'Karnataka',
    exam_category: 'SSC & other exams',
    how_did_you_hear: 'Facebook',
    plan: 'Basic Monthly',
    is_trial_active: false,
    is_subscription_active: true,
    amount_paid: 500,
    software_version: '2.1.0',
    registration_source: 'test_update',
    notes: 'Updated registration data'
  };

  try {
    const result = await crmIntegration.sendRegistration(duplicateData);
    console.log(`✅ Duplicate registration test: ${result.success ? 'PASSED' : 'FAILED'}`);
    console.log(`   Action: ${result.action}, Lead ID: ${result.lead_id}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.log('❌ Duplicate registration test: FAILED');
    console.log(`   Error: ${error}`);
  }

  console.log('\n🎉 Integration test completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Check your CRM to see if the test lead was created/updated');
  console.log('2. Verify the lead data matches the test data');
  console.log('3. Check the activity data was synced');
  console.log('4. If all tests passed, you can integrate this into your software');
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testCRMIntegration = testCRMIntegration;
  console.log('🧪 CRM Integration test ready. Run testCRMIntegration() in console to test.');
} else {
  // Node.js environment
  testCRMIntegration().catch(console.error);
}

export { testCRMIntegration }; 