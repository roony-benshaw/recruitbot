import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

const Candidate = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const res = await fetch('/candidates');
        const data = await res.json();
        // Only show candidates with score > 5
        setCandidates((data.results || []).filter((c: any) => c.score > 5));
      } catch (err) {
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates (Score &gt; 5)</h1>
          <p className="text-gray-600 mt-2">Only candidates with a score greater than 5 are shown below.</p>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-500">Loading candidates...</div>
          ) : candidates.length === 0 ? (
            <div className="text-center text-gray-500">No candidates found.</div>
          ) : candidates.map((candidate) => (
            <Card key={candidate.id} className="bg-white/70 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {candidate.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || candidate.filename?.[0] || '?'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{candidate.name || candidate.filename}</h3>
                      <p className="text-gray-600">{candidate.filename}</p>
                      <p className="text-sm text-gray-500">Score: {candidate.score}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(candidate.score)}`}>
                      <Star className="w-3 h-3 inline mr-1" />
                      {candidate.score}
                    </div>
                  </div>
                  <div>
                    <Badge className="bg-green-100 text-green-800">Qualified</Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500">{candidate.explanation}</p>
                </div>
                {candidate.upload_time && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Uploaded on {new Date(candidate.upload_time).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Candidate; 