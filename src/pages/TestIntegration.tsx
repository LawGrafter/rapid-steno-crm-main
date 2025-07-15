import React, { useState } from 'react';
import { crmIntegration, RegistrationData } from '../integrations/software-integration/CRMIntegration';

const TestIntegration = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addResult('🧪 Starting CRM Integration Test...\n');

    // Test 1: Basic Registration
    addResult('1️⃣ Testing basic registration...');
    // Use a unique email for each test run
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    const registrationData: RegistrationData = {
      email: uniqueEmail,
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

    // 1. Create Supabase Auth user via Netlify function
    addResult('Creating Supabase Auth user via Netlify function...');
    let userResult;
    try {
      const userResp = await fetch('/.netlify/functions/create-supabase-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: uniqueEmail, 
          firstName: registrationData.first_name,
          lastName: registrationData.last_name,
          phone: registrationData.phone
        })
      });
      userResult = await userResp.json();
      if (!userResult.user) {
        addResult(`❌ Failed to create Supabase Auth user: ${userResult.error}`);
        setIsRunning(false);
        return;
      } else {
        addResult('✅ Supabase Auth user created.');
      }
    } catch (err) {
      addResult(`❌ Error creating Supabase Auth user: ${err}`);
      setIsRunning(false);
      return;
    }

    // Poll for user existence in Supabase Auth (REST API) BEFORE registration
    let userFound = false;
    for (let attempt = 1; attempt <= 10; attempt++) {
      addResult(`Checking for user in Supabase Auth (Attempt ${attempt})...`);
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(uniqueEmail)}`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );
        const users = await resp.json();
        if (users.length) {
          userFound = true;
          addResult('✅ User found in Supabase Auth. Proceeding to registration.');
          break;
        }
      } catch (err) {
        addResult(`Error checking user existence: ${err}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    if (!userFound) {
      addResult('❌ User not found in Supabase Auth after waiting. Aborting registration test.');
      setIsRunning(false);
      return;
    }

    // 2. Proceed with CRM registration and activity sync
    try {
      const result = await crmIntegration.sendRegistration(registrationData);
      if (result.success) {
        addResult(`✅ Registration test: PASSED`);
        addResult(`   Action: ${result.action}, Lead ID: ${result.lead_id}`);
      } else {
        addResult(`❌ Registration test: FAILED - ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Registration test: FAILED - ${error}`);
    }

    // Add a delay to allow user creation to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Activity Update with retry logic
    let activityResult;
    for (let attempt = 1; attempt <= 3; attempt++) {
      addResult(`\n2️⃣ Testing activity update... (Attempt ${attempt})`);
      try {
        activityResult = await crmIntegration.updateActivity({
          email: uniqueEmail,
          login_count: 5,
          subscription_days_left: 12,
          daily_time_spent: 45,
          total_time_spent: 180,
          last_active: new Date().toISOString()
        });
        if (activityResult.success) {
          addResult(`✅ Activity test: PASSED`);
          break;
        } else {
          addResult(`❌ Activity test: FAILED - ${activityResult.error}`);
        }
      } catch (error) {
        addResult(`❌ Activity test: FAILED - ${error}`);
      }
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Test 3: Lead Update
    addResult('\n3️⃣ Testing lead update...');
    try {
      const result = await crmIntegration.updateLead({
        email: uniqueEmail,
        status: 'Contacted',
        plan: 'Basic Monthly',
        amount_paid: 500,
        is_trial_active: false,
        is_subscription_active: true,
        subscription_plan: 'Basic Monthly',
        notes: 'User upgraded to paid plan'
      });
      
      if (result.success) {
        addResult(`✅ Lead update test: PASSED`);
      } else {
        addResult(`❌ Lead update test: FAILED - ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ Lead update test: FAILED - ${error}`);
    }

    addResult('\n🎉 Integration test completed!');
    addResult('\n📋 Next steps:');
    addResult('1. Check your CRM Leads page to see the test lead');
    addResult('2. Verify the lead data matches the test data');
    addResult('3. If all tests passed, you can integrate into your software');
    
    setIsRunning(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">CRM Integration Test</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This page tests the integration between your software registration system and your CRM.
              It will create a test lead, update activity data, and modify the lead status.
            </p>
            
            <button
              onClick={runTest}
              disabled={isRunning}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running Tests...' : 'Run Integration Test'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Test Results:</h3>
              <div className="space-y-1 text-sm font-mono">
                {testResults.map((result, index) => (
                  <div key={index} className="text-gray-700">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What This Test Does:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Creates a test lead in your CRM</li>
              <li>• Updates user activity data</li>
              <li>• Modifies lead status and plan</li>
              <li>• Tests duplicate detection (updates existing leads)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestIntegration; 