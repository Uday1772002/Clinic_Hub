/**
 * VisitReports.jsx — List and download clinical visit reports
 *
 * Doctors see their own reports; patients see reports written
 * for them.  Each card shows the chief complaint, diagnosis and
 * a button to download the report as a PDF.
 */

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { visitReportsAPI } from "../services/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function VisitReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await visitReportsAPI.getAll();
      setReports(response.data?.data?.visitReports ?? []);
    } catch (error) {
      console.error("Error fetching visit reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownloadPDF = async (reportId, patientName) => {
    try {
      const response = await visitReportsAPI.downloadPDF(reportId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `visit-report-${patientName}-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visit Reports</h1>
        <p className="text-slate-500 mt-1">Post-visit medical reports and documentation</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-10 w-10 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-14">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No visit reports found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <div key={report._id} className="p-6 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                        <FileText className="text-violet-600" size={18} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-slate-900">
                          Visit Report &mdash; {report.patient?.firstName} {report.patient?.lastName}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Dr. {report.doctor?.firstName} {report.doctor?.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-sm">
                      <p>
                        <span className="font-medium text-slate-700">Date: </span>
                        <span className="text-slate-500">{format(new Date(report.visitDate), "MMM dd, yyyy")}</span>
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">Diagnosis: </span>
                        <span className="text-slate-500">{report.diagnosis}</span>
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">Chief Complaint: </span>
                        <span className="text-slate-500">{report.chiefComplaint}</span>
                      </p>
                      {report.additionalNotes && (
                        <p>
                          <span className="font-medium text-slate-700">Notes: </span>
                          <span className="text-slate-500">{report.additionalNotes}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleDownloadPDF(report._id, `${report.patient?.firstName}-${report.patient?.lastName}`)
                    }
                    className="ml-4 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 hover:from-indigo-700 hover:to-indigo-600 transition-all text-sm font-medium shrink-0"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
