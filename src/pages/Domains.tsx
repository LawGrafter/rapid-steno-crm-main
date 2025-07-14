import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Plus, Globe, Shield, CheckCircle, XCircle, AlertCircle, Copy } from 'lucide-react';

const Domains = () => {
  const { state } = useCRM();
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomain, setNewDomain] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDNSRecords = (domain: string) => [
    {
      type: 'TXT',
      name: `_dmarc.${domain}`,
      value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@rapidsteno.com',
      purpose: 'DMARC Policy'
    },
    {
      type: 'TXT',
      name: domain,
      value: 'v=spf1 include:_spf.rapidsteno.com ~all',
      purpose: 'SPF Record'
    },
    {
      type: 'TXT',
      name: `rapidsteno._domainkey.${domain}`,
      value: 'k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC5...',
      purpose: 'DKIM Signature'
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Domains</h1>
          <p className="text-gray-600">Manage your sending domains and authentication</p>
        </div>
        <button
          onClick={() => setShowAddDomain(true)}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Domain</span>
        </button>
      </div>

      {/* Domain List */}
      <div className="space-y-4">
        {state.domains.map((domain) => (
          <div key={domain.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{domain.domain}</h3>
                    <p className="text-sm text-gray-500">Added on {domain.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(domain.status)}`}>
                    {domain.status}
                  </span>
                  {getStatusIcon(domain.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">SPF</span>
                    {domain.spfStatus === 'valid' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Sender Policy Framework</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">DKIM</span>
                    {domain.dkimStatus === 'valid' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">DomainKeys Identified Mail</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">DMARC</span>
                    {domain.dmarcStatus === 'valid' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Domain-based Message Authentication</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Reputation</span>
                    <span className="text-lg font-bold text-green-600">{domain.reputation}%</span>
                  </div>
                  <p className="text-xs text-gray-500">Sender Reputation Score</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">DNS Records</h4>
                <div className="space-y-3">
                  {getDNSRecords(domain.domain).map((record, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                            {record.type}
                          </span>
                          <span className="text-sm font-medium text-gray-700">{record.purpose}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(record.value)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mb-1"><strong>Name:</strong> {record.name}</p>
                      <p className="text-xs text-gray-600 font-mono bg-white p-2 rounded border break-all">
                        {record.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors text-sm">
                  Verify Domain
                </button>
                <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Test Configuration
                </button>
                <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-red-600">
                  Remove Domain
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Domain Modal */}
      {showAddDomain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Domain</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After adding your domain, you'll need to configure DNS records to verify ownership and enable email authentication.
                </p>
              </div>
            </div>
            <div className="mt-6 flex space-x-2">
              <button
                onClick={() => {
                  setShowAddDomain(false);
                  setNewDomain('');
                }}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Add domain logic here
                  setShowAddDomain(false);
                  setNewDomain('');
                }}
                className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors"
              >
                Add Domain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Email Authentication Guide</h3>
        </div>
        <p className="text-blue-800 mb-4">
          Proper domain authentication is crucial for email deliverability. Here's what each record does:
        </p>
        <div className="space-y-2 text-sm text-blue-700">
          <p><strong>SPF:</strong> Specifies which servers can send emails on behalf of your domain</p>
          <p><strong>DKIM:</strong> Adds a digital signature to verify email authenticity</p>
          <p><strong>DMARC:</strong> Tells receiving servers how to handle emails that fail authentication</p>
        </div>
      </div>
    </div>
  );
};

export default Domains;