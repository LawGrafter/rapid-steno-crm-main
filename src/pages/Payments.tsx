import React, { useState } from 'react';
import {
  CreditCard,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Send,
  Plus,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Mail,
  Bell,
  RefreshCw,
  Edit,
  Trash2,
  X,
  User,
  Building,
  Phone,
  MapPin,
  Hash,
  LayoutDashboard
} from 'lucide-react';
import { Payment, Invoice } from '../types';

const Payments = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'invoices' | 'reminders'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState<Invoice | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Mock payment data
  const [payments] = useState<Payment[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Rajesh Kumar',
      userEmail: 'rajesh.kumar@lawfirm.in',
      plan: 'basic',
      amount: 197,
      currency: 'INR',
      status: 'paid',
      paymentMethod: 'upi',
      transactionId: 'TXN123456789',
      invoiceNumber: 'INV-2024-001',
      paymentDate: new Date('2024-01-15'),
      nextBillingDate: new Date('2024-02-15'),
      subscriptionStatus: 'active',
      planStartDate: new Date('2024-01-15'),
      planEndDate: new Date('2024-02-15'),
      autoRenewal: true,
      remindersSent: 0
    },
    {
      id: '2',
      userId: '2',
      userName: 'Priya Sharma',
      userEmail: 'priya.sharma@newstoday.com',
      plan: 'advanced',
      amount: 497,
      currency: 'INR',
      status: 'paid',
      paymentMethod: 'card',
      transactionId: 'TXN987654321',
      invoiceNumber: 'INV-2024-002',
      paymentDate: new Date('2024-01-20'),
      nextBillingDate: new Date('2024-04-20'),
      subscriptionStatus: 'active',
      planStartDate: new Date('2024-01-20'),
      planEndDate: new Date('2024-04-20'),
      autoRenewal: true,
      remindersSent: 0
    },
    {
      id: '3',
      userId: '3',
      userName: 'Amit Patel',
      userEmail: 'amit.patel@freelance.com',
      plan: 'basic',
      amount: 197,
      currency: 'INR',
      status: 'pending',
      paymentMethod: 'netbanking',
      transactionId: 'TXN456789123',
      invoiceNumber: 'INV-2024-003',
      paymentDate: new Date('2024-01-25'),
      dueDate: new Date('2024-01-30'),
      nextBillingDate: new Date('2024-02-25'),
      subscriptionStatus: 'trial',
      trialEndDate: new Date('2024-02-01'),
      planStartDate: new Date('2024-01-25'),
      planEndDate: new Date('2024-02-25'),
      autoRenewal: false,
      remindersSent: 2,
      lastReminderDate: new Date('2024-01-28')
    },
    {
      id: '4',
      userId: '4',
      userName: 'Dr. Sunita Verma',
      userEmail: 'sunita.verma@university.edu',
      plan: 'advanced',
      amount: 497,
      currency: 'INR',
      status: 'failed',
      paymentMethod: 'card',
      transactionId: 'TXN789123456',
      invoiceNumber: 'INV-2024-004',
      paymentDate: new Date('2024-01-22'),
      dueDate: new Date('2024-01-27'),
      subscriptionStatus: 'expired',
      planStartDate: new Date('2024-01-22'),
      planEndDate: new Date('2024-01-22'),
      autoRenewal: true,
      remindersSent: 3,
      lastReminderDate: new Date('2024-01-26')
    },
    {
      id: '5',
      userId: '7',
      userName: 'Arjun Reddy',
      userEmail: 'arjun.reddy@student.ac.in',
      plan: 'basic',
      amount: 0,
      currency: 'INR',
      status: 'pending',
      paymentMethod: 'upi',
      transactionId: '',
      invoiceNumber: '',
      paymentDate: new Date('2024-01-28'),
      subscriptionStatus: 'trial',
      trialEndDate: new Date('2024-02-04'),
      planStartDate: new Date('2024-01-28'),
      planEndDate: new Date('2024-02-28'),
      autoRenewal: false,
      remindersSent: 0
    }
  ]);

  // Mock invoice data
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      userId: '1',
      userName: 'Rajesh Kumar',
      userEmail: 'rajesh.kumar@lawfirm.in',
      plan: 'basic',
      amount: 197,
      tax: 35.46,
      total: 232.46,
      currency: 'INR',
      issueDate: new Date('2024-01-15'),
      dueDate: new Date('2024-01-22'),
      status: 'paid',
      items: [
        {
          description: 'Rapid Steno Basic Plan - Monthly Subscription',
          quantity: 1,
          rate: 197,
          amount: 197
        }
      ]
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      userId: '2',
      userName: 'Priya Sharma',
      userEmail: 'priya.sharma@newstoday.com',
      plan: 'advanced',
      amount: 497,
      tax: 89.46,
      total: 586.46,
      currency: 'INR',
      issueDate: new Date('2024-01-20'),
      dueDate: new Date('2024-01-27'),
      status: 'paid',
      items: [
        {
          description: 'Rapid Steno Advanced Plan - Quarterly Subscription',
          quantity: 1,
          rate: 497,
          amount: 497
        }
      ]
    }
  ]);

  const [newInvoice, setNewInvoice] = useState({
    userId: '',
    userName: '',
    userEmail: '',
    plan: 'basic' as 'basic' | 'advanced',
    dueDate: ''
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesPlan = planFilter === 'all' || payment.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'refunded': return <RefreshCw className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlanPrice = (plan: string) => {
    return plan === 'basic' ? '₹197/month' : '₹497/3 months';
  };

  const paymentStats = {
    totalRevenue: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    totalUsers: payments.length,
    trialUsers: payments.filter(p => p.subscriptionStatus === 'trial').length,
    paidUsers: payments.filter(p => p.subscriptionStatus === 'active').length,
    basicUsers: payments.filter(p => p.plan === 'basic' && p.subscriptionStatus === 'active').length,
    advancedUsers: payments.filter(p => p.plan === 'advanced' && p.subscriptionStatus === 'active').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    failedPayments: payments.filter(p => p.status === 'failed').length
  };

  const handleCreateInvoice = () => {
    const planAmount = newInvoice.plan === 'basic' ? 197 : 497;
    const tax = planAmount * 0.18; // 18% GST
    const total = planAmount + tax;

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      userId: newInvoice.userId,
      userName: newInvoice.userName,
      userEmail: newInvoice.userEmail,
      plan: newInvoice.plan,
      amount: planAmount,
      tax: tax,
      total: total,
      currency: 'INR',
      issueDate: new Date(),
      dueDate: new Date(newInvoice.dueDate),
      status: 'draft',
      items: [
        {
          description: `Rapid Steno ${newInvoice.plan === 'basic' ? 'Basic Plan - Monthly' : 'Advanced Plan - Quarterly'} Subscription`,
          quantity: 1,
          rate: planAmount,
          amount: planAmount
        }
      ]
    };

    console.log('Creating invoice:', invoice);
    setShowCreateInvoice(false);
    setNewInvoice({ userId: '', userName: '', userEmail: '', plan: 'basic', dueDate: '' });
  };

  const sendPaymentReminder = (payment: Payment) => {
    console.log('Sending payment reminder to:', payment.userEmail);
    // Implementation for sending reminder
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{paymentStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{paymentStats.totalUsers}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Trial Users</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{paymentStats.trialUsers}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Paid Users</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{paymentStats.paidUsers}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Basic Monthly</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{paymentStats.basicUsers}</p>
              <p className="text-xs text-gray-500 mt-1">₹197/month</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Advanced Quarterly</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{paymentStats.advancedUsers}</p>
              <p className="text-xs text-gray-500 mt-1">₹497/3 months</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{paymentStats.pendingPayments}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Failed Payments</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{paymentStats.failedPayments}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.slice(0, 5).map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                      <div className="text-sm text-gray-500">{payment.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm text-gray-900">{payment.plan}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)} flex items-center space-x-1 w-fit`}>
                      {getStatusIcon(payment.status)}
                      <span className="capitalize">{payment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.paymentDate.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic Monthly</option>
              <option value="advanced">Advanced Quarterly</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button className="border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Billing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                      <div className="text-sm text-gray-500">{payment.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">{payment.plan}</div>
                      <div className="text-sm text-gray-500">{getPlanPrice(payment.plan)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)} flex items-center space-x-1 w-fit`}>
                      {getStatusIcon(payment.status)}
                      <span className="capitalize">{payment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionStatusColor(payment.subscriptionStatus)}`}>
                      {payment.subscriptionStatus}
                    </span>
                    {payment.trialEndDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Trial ends: {payment.trialEndDate.toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.nextBillingDate ? payment.nextBillingDate.toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedPayment(payment)}
                        className="text-primary hover:text-primary-hover"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {payment.status === 'pending' && (
                        <button 
                          onClick={() => sendPaymentReminder(payment)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-900">
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
        <button
          onClick={() => setShowCreateInvoice(true)}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Invoice</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.userName}</div>
                      <div className="text-sm text-gray-500">{invoice.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {invoice.plan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{invoice.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.dueDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setShowInvoicePreview(invoice)}
                        className="text-primary hover:text-primary-hover"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReminders = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Reminders</h3>
        <div className="space-y-4">
          {payments.filter(p => p.status === 'pending' || p.status === 'failed').map((payment) => (
            <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{payment.userName}</h4>
                  <p className="text-sm text-gray-600">{payment.userEmail}</p>
                  <p className="text-sm text-gray-500">
                    {payment.plan === 'basic' ? 'Basic Monthly' : 'Advanced Quarterly'} - ₹{payment.amount}
                  </p>
                  {payment.remindersSent > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      {payment.remindersSent} reminder(s) sent
                      {payment.lastReminderDate && ` - Last: ${payment.lastReminderDate.toLocaleDateString()}`}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => sendPaymentReminder(payment)}
                    className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-1"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Send Reminder</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Manage user payments, subscriptions, and billing</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateInvoice(true)}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'invoices', label: 'Invoices', icon: FileText },
              { id: 'reminders', label: 'Reminders', icon: Bell }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'invoices' && renderInvoices()}
          {activeTab === 'reminders' && renderReminders()}
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create Invoice</h3>
              <button 
                onClick={() => setShowCreateInvoice(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter customer name"
                  value={newInvoice.userName}
                  onChange={(e) => setNewInvoice({...newInvoice, userName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter customer email"
                  value={newInvoice.userEmail}
                  onChange={(e) => setNewInvoice({...newInvoice, userEmail: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newInvoice.plan}
                  onChange={(e) => setNewInvoice({...newInvoice, plan: e.target.value as 'basic' | 'advanced'})}
                >
                  <option value="basic">Basic Monthly - ₹197</option>
                  <option value="advanced">Advanced Quarterly - ₹497</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-2">
              <button
                onClick={() => setShowCreateInvoice(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvoice}
                disabled={!newInvoice.userName || !newInvoice.userEmail || !newInvoice.dueDate}
                className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showInvoicePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Preview</h3>
              <button 
                onClick={() => setShowInvoicePreview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Invoice Content */}
            <div className="border border-gray-200 rounded-lg p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-primary">Rapid Steno</h1>
                  <p className="text-gray-600">Shorthand Software Solutions</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900">INVOICE</h2>
                  <p className="text-gray-600">{showInvoicePreview.invoiceNumber}</p>
                </div>
              </div>

              {/* Company & Customer Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
                  <div className="text-gray-600">
                    <p>Rapid Steno Technologies</p>
                    <p>123 Business Street</p>
                    <p>Mumbai, Maharashtra 400001</p>
                    <p>India</p>
                    <p>GST: 27XXXXX1234X1ZX</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                  <div className="text-gray-600">
                    <p>{showInvoicePreview.userName}</p>
                    <p>{showInvoicePreview.userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p><span className="font-medium">Invoice Date:</span> {showInvoicePreview.issueDate.toLocaleDateString()}</p>
                  <p><span className="font-medium">Due Date:</span> {showInvoicePreview.dueDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p><span className="font-medium">Status:</span> <span className="capitalize">{showInvoicePreview.status}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-900">Description</th>
                      <th className="px-4 py-2 text-center font-medium text-gray-900">Qty</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-900">Rate</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showInvoicePreview.items.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">₹{item.rate}</td>
                        <td className="px-4 py-2 text-right">₹{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span>Subtotal:</span>
                    <span>₹{showInvoicePreview.amount}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>GST (18%):</span>
                    <span>₹{showInvoicePreview.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
                    <span>Total:</span>
                    <span>₹{showInvoicePreview.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
                <p>Thank you for your business!</p>
                <p className="text-sm">For support, contact us at support@rapidsteno.com</p>
              </div>
            </div>

            <div className="mt-6 flex space-x-2">
              <button className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Download PDF
              </button>
              <button className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors">
                Send Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Customer</label>
                <p className="text-gray-900">{selectedPayment.userName}</p>
                <p className="text-sm text-gray-500">{selectedPayment.userEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Plan</label>
                <p className="text-gray-900 capitalize">{selectedPayment.plan} - {getPlanPrice(selectedPayment.plan)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Amount</label>
                <p className="text-gray-900">₹{selectedPayment.amount}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                  {selectedPayment.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                <p className="text-gray-900 font-mono">{selectedPayment.transactionId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Payment Method</label>
                <p className="text-gray-900 capitalize">{selectedPayment.paymentMethod}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Payment Date</label>
                <p className="text-gray-900">{selectedPayment.paymentDate.toLocaleDateString()}</p>
              </div>
              {selectedPayment.nextBillingDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Next Billing</label>
                  <p className="text-gray-900">{selectedPayment.nextBillingDate.toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;