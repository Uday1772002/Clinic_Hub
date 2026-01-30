/**
 * PatientDetails.jsx — Detailed patient health summary
 *
 * Shows demographics, medications, allergies and chronic conditions
 * for a single patient.  Data comes from the PatientSummary API.
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User, Pill, AlertTriangle, FileText } from "lucide-react";
import { patientsAPI } from "../services/api";

export default function PatientDetails() {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        const response = await patientsAPI.getSummary(patientId);
        setPatientData(response.data?.data?.summary ?? null);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="text-center py-14">
        <User className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Details</h1>
        <p className="text-slate-500 mt-1">Medical summary and history</p>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <User className="text-indigo-600" size={28} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {patientData.patient?.firstName} {patientData.patient?.lastName}
            </h2>
            <p className="text-slate-400 text-sm">{patientData.patient?.email}</p>
          </div>
        </div>
      </div>

      {/* Medical History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medications */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="text-indigo-600" size={18} />
            <h3 className="text-lg font-semibold text-slate-900">Medications</h3>
          </div>
          {patientData.medications?.length > 0 ? (
            <ul className="space-y-2">
              {patientData.medications.map((med, i) => (
                <li key={i} className="p-3 bg-slate-50/80 rounded-xl">
                  <p className="font-medium text-slate-800 text-sm">{med.name}</p>
                  <p className="text-xs text-slate-500">{med.dosage}</p>
                  {med.frequency && (
                    <p className="text-xs text-slate-400 mt-1">Frequency: {med.frequency}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm">No medications recorded</p>
          )}
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-rose-500" size={18} />
            <h3 className="text-lg font-semibold text-slate-900">Allergies</h3>
          </div>
          {patientData.allergies?.length > 0 ? (
            <ul className="space-y-2">
              {patientData.allergies.map((allergy, i) => (
                <li key={i} className="p-3 bg-rose-50/60 rounded-xl">
                  <p className="font-medium text-slate-800 text-sm">{allergy.name}</p>
                  <p className="text-xs text-slate-500">{allergy.severity}</p>
                  {allergy.severity && (
                    <p className="text-xs text-rose-600 mt-1 capitalize">Severity: {allergy.severity}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm">No allergies recorded</p>
          )}
        </div>
      </div>

      {/* Chronic Conditions */}
      {patientData.chronicConditions?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-slate-600" size={18} />
            <h3 className="text-lg font-semibold text-slate-900">Chronic Conditions</h3>
          </div>
          <ul className="space-y-2">
            {patientData.chronicConditions.map((cc, i) => (
              <li key={i} className="p-3 bg-slate-50/80 rounded-xl">
                <p className="font-medium text-slate-800 text-sm">{cc.condition}</p>
                <p className="text-xs text-slate-400 mt-1 capitalize">Status: {cc.status}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
