
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Star, Eye, Calendar, Download, Filter, Mail, X } from 'lucide-react';

// Remove Modal import and logic

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Go', 'Ruby', 'PHP', 'HTML', 'CSS',
  'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'Redux',
  'Express', 'Django', 'Flask', 'Spring', 'Angular', 'Vue', 'Svelte', 'Next.js', 'NestJS', 'GraphQL', 'REST', 'SASS',
  'Tailwind', 'Bootstrap', 'Jest', 'Mocha', 'Cypress', 'Testing Library', 'Linux', 'Bash', 'Figma', 'Photoshop',
  'Illustrator', 'Agile', 'Scrum', 'JIRA', 'CI/CD', 'Terraform', 'Ansible', 'Pandas', 'NumPy', 'Matplotlib', 'TensorFlow',
  'PyTorch', 'Machine Learning', 'Deep Learning', 'Data Science', 'Data Analysis', 'PowerBI', 'Tableau', 'Salesforce',
  'WordPress', 'Shopify', 'SEO', 'Marketing', 'Communication', 'Leadership', 'Teamwork', 'Problem Solving',
];

function extractSkills(text: string | undefined): string[] {
  if (!text) return [];
  const found = new Set<string>();
  for (const skill of COMMON_SKILLS) {
    const regex = new RegExp(`\\b${skill.replace(/[-.+]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) found.add(skill);
  }
  return Array.from(found);
}

const Candidates = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [openResult, setOpenResult] = useState<{ [id: number]: boolean }>({});

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const res = await fetch('/candidates');
        const data = await res.json();
        setCandidates(data.results || []);
      } catch (err) {
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    await fetch(`/delete-resume/${id}`, { method: 'DELETE' });
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-purple-100 text-purple-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Filter by search
  const filteredCandidates = candidates.filter((candidate) => {
    const q = search.toLowerCase();
    return (
      candidate.name?.toLowerCase().includes(q) ||
      candidate.filename?.toLowerCase().includes(q) ||
      candidate.explanation?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      {/* Remove Modal */}
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 text-red-800 px-4 py-2 rounded shadow">{notification}</div>
      )}
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
            <p className="text-gray-600 mt-2">
              Manage and evaluate your candidate pipeline
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-blue-200">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              className="border-green-200"
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/candidates');
                  const data = await res.json();
                  setCandidates(data.results || []);
                } catch (err) {
                  setCandidates([]);
                } finally {
                  setLoading(false);
                }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="destructive"
              className="border-red-200"
              onClick={async () => {
                if (!window.confirm('Are you sure you want to clear all candidates and resumes with score > 5? This cannot be undone.')) return;
                setLoading(true);
                setNotification(null);
                try {
                  const res = await fetch('/clear-candidates-above-score', { method: 'POST' });
                  if (!res.ok) throw new Error('Failed to clear database');
                  const data = await res.json();
                  setNotification(data.message || 'Database cleared successfully.');
                  // Refresh candidates list
                  const res2 = await fetch('/candidates');
                  const data2 = await res2.json();
                  setCandidates(data2.results || []);
                } catch (err: any) {
                  setNotification(err.message || 'Failed to clear database.');
                } finally {
                  setLoading(false);
                  setTimeout(() => setNotification(null), 3000);
                }
              }}
            >
              Clear Database
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search candidates by name or file..."
                  className="pl-10 border-blue-200"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {/* You can add filter badges here if needed */}
            </div>
          </CardContent>
        </Card>

        {/* Candidates List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading candidates...</div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center text-gray-500">No candidates found.</div>
          ) : filteredCandidates.map((candidate) => {
            // Placeholder data for new fields
            const position = candidate.position || 'Frontend Developer';
            const experience = candidate.experience || '2 years';
            const skills = candidate.skills || ['React', 'TypeScript'];
            const location = candidate.location || 'Unknown';
            const avatar = candidate.name
              ? candidate.name.split(' ').map((n) => n[0]).join('').toUpperCase()
              : (candidate.filename?.[0] || '?');
            const appliedDate = candidate.upload_time
              ? new Date(candidate.upload_time).toLocaleDateString()
              : 'N/A';
            const status = candidate.status || (candidate.score >= 90
              ? 'Shortlisted'
              : candidate.score >= 80
              ? 'Interview Scheduled'
              : candidate.score >= 70
              ? 'Under Review'
              : 'New Application');
            // Extract skills from explanation
            const skillsFromExplanation = extractSkills(candidate.explanation);
            return (
              <Card key={candidate.id} className="bg-white/90 border border-blue-100 shadow-lg hover:shadow-xl transition-shadow rounded-xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {avatar}
                    </div>
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-row items-center gap-4 flex-wrap">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-1 truncate">{candidate.name || candidate.filename}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreColor(candidate.score)} shadow-sm flex items-center gap-1`}>
                          <Star className="w-4 h-4 inline" />
                          {candidate.score}
                        </span>
                        <Badge className={getStatusColor(candidate.score)}>{status}</Badge>
                      </div>
                      <div className="text-gray-600 text-sm mb-1">{position}</div>
                      <div className="flex flex-row gap-4 flex-wrap items-center mt-2">
                        <span className="text-xs text-gray-500">Experience: <span className="font-medium text-gray-700">{experience}</span></span>
                        <span className="text-xs text-gray-500">Location: <span className="font-medium text-gray-700">{location}</span></span>
                        <span className="text-xs text-gray-500">Applied: <span className="font-medium text-gray-700">{appliedDate}</span></span>
                      </div>
                      {/* Skills as colored badges */}
                      <div className="flex flex-row flex-wrap gap-2 mt-3">
                        {skillsFromExplanation.length > 0 ? skillsFromExplanation.map((skill: string, idx: number) => (
                          <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                            {skill}
                          </span>
                        )) : <span className="text-xs text-gray-400">No skills detected</span>}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <button
                        className="p-2 rounded hover:bg-red-100"
                        aria-label="Delete candidate"
                        onClick={() => handleDelete(candidate.id)}
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </button>
                      {candidate.email && (
                        <a href={`mailto:${candidate.email}`} className="p-2 rounded hover:bg-blue-100" aria-label="Email candidate">
                          <Mail className="w-5 h-5 text-blue-500" />
                        </a>
                      )}
                      <button
                        className="p-2 rounded hover:bg-gray-100 text-xs border border-gray-200 mt-2"
                        onClick={() => setOpenResult((prev) => ({ ...prev, [candidate.id]: !prev[candidate.id] }))}
                      >
                        {openResult[candidate.id] ? 'Hide Result' : 'Show Result'}
                      </button>
                    </div>
                  </div>
                  {/* Toggleable Explanation/Result below the card */}
                  {openResult[candidate.id] && (
                    <div className="mt-6 bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line shadow-inner">
                      <span className="font-semibold text-gray-900">Result:</span>
                      <br />
                      {candidate.explanation || 'No result available.'}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Candidates;
