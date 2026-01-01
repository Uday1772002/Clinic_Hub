import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User, Calendar, Pill, AlertTriangle, FileText } from "lucide-react";
import { patientsAPI } from "../services/api";
import toast from "react-hot-toast";

export default function PatientDetails() {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        const response = await patientsAPI.getSummary(patientId);
        setPatientData(response.data.data);
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast.error("Failed to load patient details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        <p className="text-gray-600 mt-1">Medical summary and history</p>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="text-blue-600" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {patientData.patientId?.firstName}{" "}
              {patientData.patientId?.lastName}
            </h2>
            <p className="text-gray-600">{patientData.patientId?.email}</p>
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Pill className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Medications</h3>
          </div>
          {patientData.medications?.length > 0 ? (
            <ul className="space-y-2">
              {patientData.medications.map((med, index) => (
                <li key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{med.name}</p>
                  <p className="text-sm text-gray-600">{med.dosage}</p>
                  {med.frequency && (
                    <p className="text-xs text-gray-500 mt-1">
                      Frequency: {med.frequency}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No medications recorded</p>
          )}
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="text-red-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Allergies</h3>
          </div>
          {patientData.allergies?.length > 0 ? (
            <ul className="space-y-2">
              {patientData.allergies.map((allergy, index) => (
                <li key={index} className="p-3 bg-red-50 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {allergy.allergen}
                  </p>
                  <p className="text-sm text-gray-600">{allergy.reaction}</p>
                  {allergy.severity && (
                    <p className="text-xs text-red-600 mt-1 capitalize">
                      Severity: {allergy.severity}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No allergies recorded</p>
          )}
        </div>
      </div>

      {/* Medical History Notes */}
      {patientData.medicalHistory && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="text-gray-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">
              Medical History
            </h3>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">
            {patientData.medicalHistory}
          </p>
        </div>
      )}
    </div>
  );
}
