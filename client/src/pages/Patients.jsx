import { useState } from "react";
import { Users, Search } from "lucide-react";

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");

  // This would typically fetch from an API endpoint
  // For now, showing a message about viewing patient details
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-600 mt-1">View and manage patient records</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search patients by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Patient records are accessed through appointments
          </p>
          <p className="mt-1 text-xs text-gray-500">
            View patient details from the appointments page
          </p>
        </div>
      </div>
    </div>
  );
}
