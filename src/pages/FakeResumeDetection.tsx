
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Shield, CheckCircle, FileText } from 'lucide-react';

const FakeResumeDetection = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResults, setDetectionResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
    }
  };

  // Open file dialog
  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  // Helper to send non-fake resumes to Resume Parser
  const sendNonFakeResumesToParser = async (nonFakeFiles: File[], jobDescription: string) => {
    if (nonFakeFiles.length === 0) return;
    const formData = new FormData();
    nonFakeFiles.forEach((file) => {
      formData.append('resumes', file);
    });
    formData.append('job_description', jobDescription);
    try {
      await fetch('/parse-resumes', {
        method: 'POST',
        body: formData,
      });
      setNotification('Non-fake resumes have been sent to Resume Parser for further analysis. You can view them in the Resume Parser section.');
    } catch (err) {
      setNotification('Failed to send non-fake resumes to Resume Parser.');
    }
  };

  // Handle form submission
  const handleDetection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedFiles.length === 0 || !jobDescription) return;
    setIsProcessing(true);
    setError(null);
    setDetectionResults([]);
    setNotification(null);
    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append('resumes', file);
    });
    formData.append('job_description', jobDescription);
    try {
      const response = await fetch('/detect', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      setDetectionResults(data.results || []);
      // Find non-fake resumes and send to parser
      const nonFakeFiles: File[] = [];
      (data.results || []).forEach((result: any, idx: number) => {
        const matchFake = result.result && result.result.match(/Fake:\s*(Yes|No)/i);
        const isFake = matchFake ? matchFake[1].toLowerCase() === 'yes' : false;
        if (!isFake && uploadedFiles[idx]) {
          nonFakeFiles.push(uploadedFiles[idx]);
        }
      });
      if (nonFakeFiles.length > 0) {
        await sendNonFakeResumesToParser(nonFakeFiles, jobDescription);
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fake Resume Detection</h1>
          <p className="text-gray-600 mt-2">
            Upload multiple resumes and enter a job description to detect potential fraud and authenticity issues.
          </p>
        </div>
        {notification && (
          <div className="bg-green-100 border border-green-300 text-green-800 rounded p-4 text-center">
            {notification} <br />
            <button
              className="underline text-blue-700 font-semibold mt-2"
              onClick={() => navigate('/resume-parser')}
            >
              Go to Resume Parser
            </button>
          </div>
        )}

        {/* Upload & Form Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>Upload Resumes for Detection</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleDetection}>
              <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Drop resumes here or click to browse
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Support for PDF files up to 10MB each
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
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
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Job Description Input */}
              <div className="mt-4">
                <label htmlFor="job-description" className="block font-medium text-gray-900 mb-2">Job Description:</label>
                <textarea
                  id="job-description"
                  className="w-full border border-blue-200 rounded-lg p-2 min-h-[100px]"
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Enter the job requirements, responsibilities, and qualifications..."
                  required
                />
              </div>

              {/* Detect Button */}
              <Button
                type="submit"
                disabled={uploadedFiles.length === 0 || !jobDescription || isProcessing}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 mt-4"
              >
                <Shield className="w-4 h-4 mr-2" />
                {isProcessing ? 'Detecting...' : 'Detect'}
              </Button>
              {error && <div className="text-red-600 mt-2">Error: {error}</div>}
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {detectionResults.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Detection Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detectionResults.map((result, idx) => {
                  // Parse the backend result string
                  let fakeStatus = '';
                  let reason = '';
                  if (result.result) {
                    const matchFake = result.result.match(/Fake:\s*(Yes|No)/i);
                    const matchReason = result.result.match(/Reason:\s*(.*)/i);
                    fakeStatus = matchFake ? matchFake[1] : '';
                    reason = matchReason ? matchReason[1] : '';
                  }
                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white/50">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {result.name && result.name !== 'Unknown' ? result.name : 'Unknown'}
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={
                            fakeStatus.toLowerCase() === 'yes'
                              ? 'px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800'
                              : fakeStatus.toLowerCase() === 'no'
                              ? 'px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800'
                              : 'px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-800'
                          }
                        >
                          {fakeStatus ? `Fake: ${fakeStatus}` : 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1 font-semibold">Reason:</p>
                        <p className="text-sm text-gray-900">{reason || result.result}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default FakeResumeDetection;
