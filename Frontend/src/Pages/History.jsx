import React, { useState } from 'react';
import {
  Clock, FileText, ChevronRight, TrendingUp,
  Download, Eye, Calendar, ArrowUpRight, ArrowDownRight,
  Diff, Filter, ArrowLeft
} from 'lucide-react';

const ResumeHistory = () => {
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [filter, setFilter] = useState('all');
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion, setCompareVersion] = useState(null);

  // Sample history data
  const sampleHistory = {
    resumes: [
      {
        id: "a71ead38033aaa4bab7f39ed0c10a10e",
        filename: "Naukri_SatyajitRaskar[12y_0m].pdf",
        versions: [
          {
            timestamp: "2025-01-31T14:46:31.564982",
            score: 45,
            changes: -5,
            file_type: "application/pdf",
            word_count: 341,
            key_issues: ["Grammar", "Formatting", "Missing Sections"]
          },
          {
            timestamp: "2025-01-15T10:22:15.123456",
            score: 50,
            changes: +8,
            file_type: "application/pdf",
            word_count: 338,
            key_issues: ["Grammar", "Formatting"]
          },
          {
            timestamp: "2025-01-01T09:15:42.987654",
            score: 42,
            changes: null,
            file_type: "application/pdf",
            word_count: 325,
            key_issues: ["Grammar", "Formatting", "Missing Sections", "Keywords"]
          }
        ]
      },
      {
        id: "b82fed49144bbb5cbc8f4aed1d21b21f",
        filename: "Resume_Technical_2025.pdf",
        versions: [
          {
            timestamp: "2025-01-30T16:20:45.123456",
            score: 78,
            changes: +15,
            file_type: "application/pdf",
            word_count: 425,
            key_issues: ["Formatting"]
          },
          {
            timestamp: "2025-01-20T11:30:22.987654",
            score: 63,
            changes: null,
            file_type: "application/pdf",
            word_count: 410,
            key_issues: ["Grammar", "Formatting", "Keywords"]
          }
        ]
      }
    ]
  };

  const handleBack = () => {
    if (compareMode) {
      setCompareMode(false);
      setCompareVersion(null);
    } else if (selectedVersion) {
      setSelectedVersion(null);
    } else if (selectedResume) {
      setSelectedResume(null);
    }
  };

  const ResumeCard = ({ resume }) => {
    const latestVersion = resume.versions[0];
    const previousVersion = resume.versions[1];
    const scoreChange = previousVersion ? latestVersion.score - previousVersion.score : 0;

    return (
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{resume.filename}</h3>
              <p className="text-sm text-gray-500">
                {resume.versions.length} versions • Last updated {new Date(latestVersion.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium
            ${latestVersion.score >= 70 ? 'bg-green-100 text-green-800' :
              latestVersion.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'}`}>
            Score: {latestVersion.score}%
          </div>
        </div>

        {scoreChange !== 0 && (
          <div className="mt-4 flex items-center">
            {scoreChange > 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <span className={`ml-1 text-sm ${scoreChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(scoreChange)}% from previous version
            </span>
          </div>
        )}

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {latestVersion.key_issues.map((issue, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {issue}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
              onClick={() => setSelectedVersion(latestVersion)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </button>
            <button
              className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </button>
          </div>
          <button
            className="flex items-center text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
            onClick={() => setSelectedResume(resume)}
          >
            Resume Version History
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  const VersionCard = ({ version, isCompareVersion }) => (
    <div className={`bg-white rounded-lg shadow p-6 ${isCompareVersion ? 'border-2 border-blue-500' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 ">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">
            {new Date(version.timestamp).toLocaleString()}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium
          ${version.score >= 70 ? 'bg-green-100 text-green-800' :
            version.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'}`}>
          Score: {version.score}%
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Word Count:</span>
          <span className="font-medium">{version.word_count}</span>
        </div>
        <div>
          <span className="text-sm text-gray-600">Key Issues:</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {version.key_issues.map((issue, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {issue}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const VersionCompare = ({ version1, version2 }) => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold"> Resume Version Comparison</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium mb-4">Current Version</h4>
          <VersionCard version={version1} />
        </div>
        <div>
          <h4 className="text-lg font-medium mb-4">Previous Version</h4>
          <VersionCard version={version2} isCompareVersion={true} />
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-lg font-medium mb-2">Changes</h4>
        <ul className="space-y-2">
          <li className="text-sm">
            Score change: {' '}
            <span className={version1.score > version2.score ? 'text-green-600' : 'text-red-600'}>
              {version1.score - version2.score}%
            </span>
          </li>
          <li className="text-sm">
            Word count change: {version1.word_count - version2.word_count} words
          </li>
        </ul>
      </div>
    </div>
  );

  const VersionHistory = ({ resume }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Resume Version History</h3>
        <button
          className="flex items-center text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        {resume.versions.map((version, index) => (
          <div key={index} className="relative pl-10 pb-8">
            <div className="absolute left-2 -ml-px w-5 h-5 rounded-full bg-white border-2 border-blue-500" />
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <VersionCard version={version} />
                <div className="mt-4 flex justify-end space-x-4">
                  <button
                    className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
                    onClick={() => setSelectedVersion(version)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button
                    className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                  {index > 0 && (
                    <button
                      className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
                      onClick={() => {
                        setCompareMode(true);
                        setCompareVersion(resume.versions[index - 1]);
                        setSelectedVersion(version);
                      }}
                    >
                      <Diff className="h-4 w-4 mr-1" />
                      Compare with Previous
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const filteredResumes = sampleHistory.resumes.filter(resume => {
    if (filter === 'all') return true;
    const latestScore = resume.versions[0].score;
    const previousScore = resume.versions[1]?.score;
    if (!previousScore) return true;
    if (filter === 'improved') return latestScore > previousScore;
    if (filter === 'declined') return latestScore < previousScore;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-11">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {(selectedResume || selectedVersion || compareMode) && (
              <button
                className="flex items-center text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {compareMode ? 'Compare Versions' :
                selectedVersion ? 'Version Details' :
                  selectedResume ? 'Version History' :
                    'Resume History'}
            </h2>
          </div>
          {!selectedResume && !selectedVersion && !compareMode && (
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                className="border border-gray-200 rounded-lg text-gray-600 p-2"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Resumes</option>
                <option value="improved">Improved</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {compareMode ? (
            <VersionCompare version1={selectedVersion} version2={compareVersion} />
          ) : selectedVersion ? (
            <VersionCard version={selectedVersion} />
          ) : selectedResume ? (
            <VersionHistory resume={selectedResume} />
          ) : (
            filteredResumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeHistory;