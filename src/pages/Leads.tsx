import { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { Lead } from '../types';

const Leads = () => {
  const [leads] = useState<Lead[]>([]);
  const [statusFilter] = useState<string>('all');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-bold text-gray-800">Leads</h1>
        </div>
        <button className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        {leads.length === 0 ? (
          <p className="text-gray-600">No leads found. Status filter: {statusFilter}</p>
        ) : (
          <div className="space-y-4">
            {leads.map(lead => (
              <div key={lead.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{lead.name}</h3>
                <p className="text-gray-600">{lead.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;