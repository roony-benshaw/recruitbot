

import { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Zap, CheckCircle, AlertCircle, X } from 'lucide-react';

const ResumeParser = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetchedParsedResumes, setFetchedParsedResumes] = useState<any[]>([]); // New state
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch parsed resumes sent from FakeResumeDetection on mount
  useEffect(() => {
    const fetchParsedResumes = async () => {
      try {
        const response = await fetch('/parsed-resumes');
        if (!response.ok) throw new Error('Failed to fetch parsed resumes');
        const data = await response.json();
        setFetchedParsedResumes(data.results || []);

        // Automatically add all resumes to upload queue
        if (data.results && data.results.length > 0) {
          // Download each file and reconstruct File objects
          const filePromises = data.results.map(async (resume) => {
            if (!resume.stored_filename) return null;
            const res = await fetch(`/download-resume/${resume.stored_filename}`);
            if (!res.ok) return null;
            const blob = await res.blob();
            // Ensure the filename has the correct extension
            const originalName = resume.filename || resume.stored_filename;
            const ext = resume.stored_filename?.split('.').pop();
            const nameWithExt = originalName.endsWith(`.${ext}`) ? originalName : `${originalName}.${ext}`;
            return new File([blob], nameWithExt, { type: blob.type });
          });
          const files = (await Promise.all(filePromises)).filter(Boolean);
          setUploadedFiles((prev) => {
            const existingNames = new Set(prev.map(f => f.name));
            const newFiles = files.filter(f => !existingNames.has(f.name));
            return [...prev, ...newFiles];
          });
        }
      } catch (err: any) {
        // Optionally handle error
      }
    };
    fetchParsedResumes();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles((prev) => {
        const existingNames = new Set(prev.map(f => f.name));
        const newFiles = Array.from(files).filter(f => !existingNames.has(f.name));
        if (newFiles.length < Array.from(files).length) {
          setNotification('Duplicate file(s) skipped.');
          setTimeout(() => setNotification(null), 2000);
        }
        const updated = [...prev, ...newFiles];
        console.log('uploadedFiles after manual upload:', updated);
        return updated;
      });
    }
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  // Delete candidate from backend and UI
  const handleDeleteResume = async (resume: any, idx: number) => {
    // Remove from backend by stored_filename if it exists
    if (resume.stored_filename) {
      console.log("Deleting stored_filename:", resume.stored_filename);
      const res = await fetch(`/delete-resume-by-stored-filename/${encodeURIComponent(resume.stored_filename)}`, { method: 'DELETE' });
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        console.log("No JSON in response");
      }
      console.log("Delete response:", data);
    }
    // Refetch from backend to ensure UI is in sync
    const response = await fetch('/parsed-resumes');
    if (response.ok) {
      const data = await response.json();
      setFetchedParsedResumes(data.results || []);
    }
    setNotification('Candidate removed successfully.');
    setTimeout(() => setNotification(null), 2000);
  };

  // Add candidate to Candidates section (backend) via /parse-resumes
  const handleViewInCandidate = async (resume: any) => {
    // Find the corresponding File object
    const ext = resume.stored_filename?.split('.').pop();
    const originalName = resume.filename || resume.stored_filename;
    const nameWithExt = originalName.endsWith(`.${ext}`) ? originalName : `${originalName}.${ext}`;
    const file = uploadedFiles.find(f => f.name === nameWithExt);
    if (!file) {
      setNotification('Resume file not found for upload.');
      setTimeout(() => setNotification(null), 2000);
      return;
    }
    const formData = new FormData();
    formData.append('resumes', file);
    formData.append('job_description', jobDescription);
    try {
      const response = await fetch('/parse-resumes', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to add candidate');
      setNotification('Candidate added to Candidates section!');
      setTimeout(() => setNotification(null), 2000);
    } catch (err) {
      setNotification('Failed to add candidate.');
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedFiles.length === 0 || !jobDescription) return;
    setIsProcessing(true);
    setError(null);
    setProcessedFiles([]);
    setUploadProgress(0);
    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append('resumes', file);
    });
    formData.append('job_description', jobDescription);
    // Log FormData contents
    for (let pair of formData.entries()) {
      console.log('FormData entry:', pair[0], pair[1]);
    }
    try {
      const response = await fetch('/parse-resumes', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      setProcessedFiles(data.results || []);
      setUploadProgress(100);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleJobDescription = `We are looking for a Senior Frontend Developer to join our team.

Requirements:
• 5+ years of React development experience
• Strong knowledge of TypeScript
• Experience with modern build tools (Webpack, Vite)
• Knowledge of state management (Redux, Zustand)
• Experience with testing frameworks (Jest, React Testing Library)
• Excellent communication skills
• Bachelor's degree in Computer Science or related field

Nice to have:
• Next.js experience
• GraphQL knowledge
• AWS/Cloud experience
• Leadership experience`;

  // After setProcessedFiles(data.results || []), filter to only show the latest result for each file
  function getLatestResults(results: any[]) {
    const map = new Map();
    results.forEach(r => {
      // Use stored_filename if available, else filename
      const key = r.stored_filename || r.filename;
      // Prefer real explanation over placeholder
      if (!map.has(key) || (map.get(key).explanation === 'Parsing in progress...' && r.explanation !== 'Parsing in progress...')) {
        map.set(key, r);
      }
    });
    return Array.from(map.values());
  }

  return (
    <Layout>
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 text-green-800 px-4 py-2 rounded shadow">{notification}</div>
      )}
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Parser</h1>
          <p className="text-gray-600 mt-2">
            Upload job descriptions and resumes for AI-powered analysis and matching
          </p>
          <Button
            type="button"
            className="mt-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
            onClick={async () => {
              if (!window.confirm('Are you sure you want to clear all resumes and candidates from the database? This cannot be undone.')) return;
              try {
                const response = await fetch('/clear-resumes', { method: 'POST' });
                if (!response.ok) throw new Error('Failed to clear database');
                setNotification('Database cleared successfully.');
                setFetchedParsedResumes([]);
                setUploadedFiles([]);
                setProcessedFiles([]);
              } catch (err) {
                setNotification('Failed to clear database.');
              }
              setTimeout(() => setNotification(null), 2000);
            }}
          >
            Clear Database
          </Button>
        </div>

        {/* Removed Resumes Sent Section */}

        <form onSubmit={handleParse}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Job Description - reduced size */}
            <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Job Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 pb-2">
                <div>
                  <Label htmlFor="job-description" className="text-sm">
                    Paste your job description here
                  </Label>
                  <Textarea
                    id="job-description"
                    placeholder="Enter the job requirements, responsibilities, and qualifications..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[120px] border-blue-200 focus:border-blue-400 mt-2 text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setJobDescription(sampleJobDescription)}
                    variant="outline"
                    className="border-blue-200 text-xs px-3 py-1"
                    type="button"
                  >
                    Load Sample
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-green-200 text-xs px-3 py-1"
                    type="button"
                  >
                    Save Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resume Upload */}
            <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-teal-600" />
                  <span>Upload Resumes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Drop files here or click to browse
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Support for PDF, DOCX, TXT files up to 10MB each
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <Button
                      type="button"
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                      onClick={handleChooseFiles}
                    >
                      Choose Files
                    </Button>
                  </div>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
                    {Array.from(new Map(uploadedFiles.map(f => [f.name, f])).values()).map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <button
                            type="button"
                            className="ml-2 p-1 rounded hover:bg-red-100"
                            aria-label="Remove file"
                            onClick={() => setUploadedFiles(prev => prev.filter(f => f.name !== file.name))}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Processing Status */}
                {isProcessing && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium">Processing resumes...</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Start Analysis Button */}
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  disabled={!jobDescription || isProcessing || uploadedFiles.length === 0}
                  type="submit"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Start AI Analysis
                </Button>
                {error && <div className="text-red-600 mt-2">Error: {error}</div>}
              </CardContent>
            </Card>
          </div>
        </form>

        {/* Results */}
        {processedFiles.length > 0 && (
          <>
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Analysis Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getLatestResults(processedFiles).map((file, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          file.score !== null && file.score >= 7 ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {file.score !== null && file.score >= 7 ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {file.name && file.name !== 'Unknown' ? file.name : 'Unknown'}
                          </h4>
                          <p className="text-xs text-gray-500">{file.filename}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Explanation:</p>
                      <pre className="bg-gray-100 rounded p-2 text-xs whitespace-pre-wrap">{file.explanation}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Refresh Candidates Button */}
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              onClick={async () => {
                // Handler for Refresh Candidates
                const passingCandidates = processedFiles.filter(f => f.score > 5);
                if (passingCandidates.length === 0) {
                  setNotification('No candidates with score > 5 to add.');
                  setTimeout(() => setNotification(null), 2000);
                  return;
                }
                let addedCount = 0;
                for (const candidate of passingCandidates) {
                  // Try to find the file in uploadedFiles
                  const ext = candidate.filename?.split('.')?.pop();
                  const originalName = candidate.name || candidate.filename;
                  const nameWithExt = originalName && ext && !originalName.endsWith(`.${ext}`)
                    ? `${originalName}.${ext}`
                    : originalName;
                  const file = uploadedFiles.find(f => f.name === nameWithExt || f.name === candidate.filename);
                  if (!file) continue;
                  const formData = new FormData();
                  formData.append('resumes', file);
                  formData.append('job_description', jobDescription);
                  try {
                    const response = await fetch('/parse-resumes', {
                      method: 'POST',
                      body: formData,
                    });
                    if (response.ok) addedCount++;
                  } catch (err) {
                    // Ignore error for this candidate
                  }
                }
                setNotification(`${addedCount} candidate(s) added to Candidates section!`);
                setTimeout(() => setNotification(null), 2000);
              }}
            >
              Refresh Candidates
            </Button>
          </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ResumeParser;
