import { Globe } from 'lucide-react';

const Domains = () => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Globe className="w-8 h-8 text-accent" />
        <h1 className="text-3xl font-bold text-gray-800">Domains</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-600">Domain management coming soon...</p>
      </div>
    </div>
  );
};

export default Domains;