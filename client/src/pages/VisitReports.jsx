import { useEffect, useState } from "react";
import { FileText, Download, Plus } from "lucide-react";
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
      setReports(response.data.data || []);
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
      link.setAttribute(
        "download",
        `visit-report-${patientName}-${reportId}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download report");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visit Reports</h1>
          <p className="text-gray-600 mt-1">
            Post-visit medical reports and documentation
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">No visit reports found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <div
                key={report._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Visit Report - {report.patientId?.firstName}{" "}
                          {report.patientId?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Dr. {report.doctorId?.firstName}{" "}
                          {report.doctorId?.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Date:{" "}
                        </span>
                        <span className="text-gray-600">
                          {format(new Date(report.visitDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Diagnosis:{" "}
                        </span>
                        <span className="text-gray-600">
                          {report.diagnosis}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Treatment:{" "}
                        </span>
                        <span className="text-gray-600">
                          {report.treatment}
                        </span>
                      </div>
                      {report.notes && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Notes:{" "}
                          </span>
                          <span className="text-gray-600">{report.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleDownloadPDF(
                        report._id,
                        `${report.patientId?.firstName}-${report.patientId?.lastName}`
                      )
                    }
                    className="ml-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={18} />
                    <span>Download PDF</span>
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
