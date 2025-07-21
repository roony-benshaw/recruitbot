
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Video, Phone, MapPin, Plus, User, Mail } from 'lucide-react';

const Interviews = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<any[]>([]);

  const BACKEND_URL = 'http://localhost:5000';

  // Fetch candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/candidates`);
        const data = await res.json();
        setCandidates(data.results || []);
      } catch (err) {
        setCandidates([]);
      }
    };
    fetchCandidates();
  }, []);

  // Fetch scheduled interviews
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/interviews`);
        const data = await res.json();
        setInterviews(data.results || []);
      } catch (err) {
        setInterviews([]);
      }
    };
    fetchInterviews();
  }, [notification]); // refetch after scheduling

  const handleSchedule = async () => {
    if (!selectedCandidate || !date || !time) {
      setNotification('Please select candidate, date, and time.');
      return;
    }
    setLoading(true);
    setNotification(null);
    try {
      const res = await fetch(`${BACKEND_URL}/schedule-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: selectedCandidate,
          interview_date: date,
          interview_time: time,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule interview');
      setNotification(data.message || 'Interview scheduled and email sent!');
      setSelectedCandidate('');
      setDate('');
      setTime('');
      setType('');
    } catch (err: any) {
      setNotification(err.message || 'Failed to schedule interview.');
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleCancel = async (interviewId: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/cancel-interview/${interviewId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel interview');
      setNotification(data.message || 'Interview cancelled.');
      setInterviews((prev) => prev.filter((i) => i.id !== interviewId));
    } catch (err: any) {
      setNotification(err.message || 'Failed to cancel interview.');
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rescheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {notification && (
          <div className="fixed top-4 right-4 z-50 bg-blue-100 text-blue-800 px-4 py-2 rounded shadow">{notification}</div>
        )}
        {/* Schedule New Interview Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Schedule New Interview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <Label htmlFor="candidate">Select candidate</Label>
                <select
                  id="candidate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-400 bg-white"
                  value={selectedCandidate}
                  onChange={e => setSelectedCandidate(e.target.value)}
                >
                  <option value="">Select candidate</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.filename}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  placeholder="dd-mm-yyyy"
                  className="border-gray-300"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="time">Select time</Label>
                <Input
                  id="time"
                  type="time"
                  className="border-gray-300"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="type">Interview type</Label>
                <select
                  id="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-400 bg-white"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="">Interview type</option>
                  <option value="technical">Technical</option>
                  <option value="hr">HR Round</option>
                  <option value="final">Final Round</option>
                </select>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 h-10"
                onClick={handleSchedule}
                disabled={loading}
              >
                {loading ? 'Scheduling...' : 'Schedule'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Interviews Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <CardTitle>Upcoming Interviews</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {interviews.length} scheduled
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interviews.length === 0 ? (
                <div className="text-center text-gray-500">No interviews scheduled.</div>
              ) : interviews.map((interview) => (
                <div key={interview.id} className="border border-gray-200 rounded-lg p-4 bg-white/50 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    {/* Left side - Candidate info */}
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                        {interview.candidate_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{interview.candidate_name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span className="text-sm">{interview.interview_datetime?.split(' ')[0]}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm">{interview.interview_datetime?.split(' ')[1]}</span>
                          </div>
                        </div>
                        {interview.email && (
                          <div className="flex items-center space-x-1 text-blue-600 mt-1">
                            <Mail className="w-3 h-3" />
                            <span className="text-sm">{interview.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Right side - Status and actions */}
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor('confirmed')}>confirmed</Badge>
                      <Badge variant="outline" className="border-blue-200">
                        {type || 'Interview'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="ml-2"
                        onClick={() => handleCancel(interview.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Interviews;
