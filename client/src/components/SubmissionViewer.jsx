import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Loader2,
  User,
  History,
  GraduationCap,
  PenTool
} from 'lucide-react';
import DocumentViewer from './DocumentViewer';
import WritingAnalyzer from './WritingAnalyzer';

const SubmissionContent = ({ submission }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  if (submission.assignmentSubmission) {
    return (
      <div className="space-y-6">
        <h3 className="font-semibold text-gray-700">Assignment Submission</h3>
        <div className="space-y-4">
          {submission.assignmentSubmission.attachments?.map((attachment, index) => (
            <div key={index} className="space-y-4">
              {/* Document Card */}
              <div 
                className={`
                  bg-white rounded-lg border transition-all duration-200
                  ${selectedDocument?.id === attachment.driveFile?.id 
                    ? 'border-purple-300 shadow-md' 
                    : 'border-gray-200 hover:border-purple-200'
                  }
                `}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {attachment.driveFile?.title || 'Document'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Click to {selectedDocument?.id === attachment.driveFile?.id ? 'hide' : 'view'} document
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDocument(
                          selectedDocument?.id === attachment.driveFile?.id 
                            ? null 
                            : attachment.driveFile
                        )}
                        className={`
                          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                          transition-colors duration-200
                          ${selectedDocument?.id === attachment.driveFile?.id
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                          }
                        `}
                      >
                        <span>{selectedDocument?.id === attachment.driveFile?.id ? 'Hide' : 'View'}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 
                          ${selectedDocument?.id === attachment.driveFile?.id ? 'rotate-180' : ''}`} 
                        />
                      </button>

                      <a 
                        href={attachment.driveFile?.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-purple-600 hover:text-purple-700 
                          hover:bg-purple-50 rounded-lg transition-colors duration-200"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Viewer and Analysis */}
              {selectedDocument && selectedDocument.id === attachment.driveFile?.id && (
                <div className="space-y-6 transform transition-all duration-200">
                  <DocumentViewer 
                    fileId={attachment.driveFile.id}
                    fileName={attachment.driveFile.title}
                    alternateLink={attachment.driveFile.alternateLink}
                  />
                  
                  <div className="border-t border-gray-200 pt-6">
                    <WritingAnalyzer documentId={attachment.driveFile.id} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-gray-600">No submission content available</p>
    </div>
  );
};

const SubmissionViewer = ({ courseId, courseWorkId, title, submissions }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState({});

  if (!submissions) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
          <p className="mt-2 text-purple-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  const getSubmissionStatus = (submission) => {
    switch (submission.state) {
      case 'TURNED_IN':
        return {
          Icon: CheckCircle,
          label: 'Turned In',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50'
        };
      case 'RETURNED':
        return {
          Icon: PenTool,
          label: 'Graded',
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        };
      default:
        return {
          Icon: Clock,
          label: 'Pending',
          color: 'text-amber-600',
          bg: 'bg-amber-50'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
          <p className="mt-2 text-purple-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3 text-red-600">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold">Error loading submissions</h3>
            <p className="text-red-600/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const submissionsList = Array.isArray(submissions) ? submissions : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {submissionsList.length} Submissions
          </span>
        </div>
      </div>

      {/* Submissions List */}
      <div className="divide-y divide-gray-200">
        {submissionsList.map((submission) => {
          const status = getSubmissionStatus(submission);
          const StatusIcon = status.Icon;

          return (
            <div key={submission.id} className="py-4">
              {/* Student Info & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {submission.student?.photoUrl ? (
                    <img 
                      src={submission.student.photoUrl} 
                      alt={submission.student.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-purple-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{submission.student?.name}</h3>
                    <p className="text-sm text-gray-500">{submission.student?.email}</p>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full ${status.bg} ${status.color} 
                  flex items-center gap-2 text-sm font-medium`}>
                  <StatusIcon className="h-4 w-4" />
                  <span>{status.label}</span>
                </div>
              </div>

              {/* Submission Content */}
              <div className="space-y-4">
                <SubmissionContent submission={submission} />

                {/* Submission History */}
                {submission.submissionHistory?.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <History className="h-4 w-4" />
                      <h4 className="font-semibold">Submission History</h4>
                    </div>
                    <div className="space-y-2">
                      {submission.submissionHistory.map((history, index) => (
                        <div 
                          key={index}
                          className="p-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex justify-between text-gray-600">
                            <span>{history.stateHistory?.state || history.gradeHistory?.gradeState}</span>
                            <span>{new Date(history.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubmissionViewer; 