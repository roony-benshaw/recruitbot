
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bot, Play, Settings, Brain, Zap } from 'lucide-react';

const InterviewAI = () => {
  const aiFeatures = [
    {
      title: 'Automated Screening',
      description: 'AI conducts initial candidate screenings with customizable questions',
      icon: Bot,
      status: 'Available',
    },
    {
      title: 'Real-time Analysis',
      description: 'Live sentiment and response analysis during interviews',
      icon: Brain,
      status: 'Beta',
    },
    {
      title: 'Interview Insights',
      description: 'Comprehensive reports with candidate evaluation metrics',
      icon: Zap,
      status: 'Available',
    },
    {
      title: 'Question Generator',
      description: 'AI-powered interview questions based on job requirements',
      icon: MessageSquare,
      status: 'Coming Soon',
    },
  ];

  const activeInterviews = [
    {
      id: 1,
      candidate: 'Sarah Johnson',
      position: 'Senior Frontend Developer',
      status: 'In Progress',
      duration: '15:32',
      aiScore: 85,
    },
    {
      id: 2,
      candidate: 'Michael Chen',
      position: 'Backend Engineer',
      status: 'Completed',
      duration: '22:45',
      aiScore: 92,
    },
    {
      id: 3,
      candidate: 'Emily Davis',
      position: 'Full Stack Developer',
      status: 'Scheduled',
      duration: 'Not started',
      aiScore: null,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeatureStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Beta':
        return 'bg-blue-100 text-blue-800';
      case 'Coming Soon':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Interview Assistant</h1>
          <p className="text-gray-600 mt-2">
            Leverage AI to enhance your interview process and candidate evaluation
          </p>
        </div>

        {/* AI Features Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="bg-white/70 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  <Badge className={getFeatureStatusColor(feature.status)}>
                    {feature.status}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <span>AI Interview Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button className="h-auto p-6 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                <div className="text-center">
                  <Play className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm font-medium">Start AI Interview</div>
                  <div className="text-xs opacity-90">Begin automated screening</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-6 border-purple-200 hover:bg-purple-50">
                <div className="text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-sm font-medium">Generate Questions</div>
                  <div className="text-xs text-gray-600">AI-powered questions</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-6 border-green-200 hover:bg-green-50">
                <div className="text-center">
                  <Settings className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-sm font-medium">Configure AI</div>
                  <div className="text-xs text-gray-600">Customize settings</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active/Recent Interviews */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle>AI Interview Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeInterviews.map((interview) => (
                <div key={interview.id} className="border border-gray-200 rounded-lg p-4 bg-white/50">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Candidate Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{interview.candidate}</h3>
                      <p className="text-gray-600">{interview.position}</p>
                    </div>

                    {/* Status */}
                    <Badge className={getStatusColor(interview.status)}>
                      {interview.status}
                    </Badge>

                    {/* Duration */}
                    <div className="text-sm text-gray-600">
                      Duration: {interview.duration}
                    </div>

                    {/* AI Score */}
                    {interview.aiScore && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">AI Score:</span>
                        <div className={`px-2 py-1 rounded-full text-sm font-bold ${
                          interview.aiScore >= 90 ? 'bg-green-100 text-green-800' :
                          interview.aiScore >= 80 ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {interview.aiScore}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {interview.status === 'In Progress' && (
                        <Button size="sm" className="bg-red-500 hover:bg-red-600">
                          Join Live
                        </Button>
                      )}
                      {interview.status === 'Completed' && (
                        <Button size="sm" variant="outline">
                          View Report
                        </Button>
                      )}
                      {interview.status === 'Scheduled' && (
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-teal-600">
                          Start Interview
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Settings Preview */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Interview Settings</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Question Difficulty</span>
                    <span className="font-medium">Adaptive</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interview Duration</span>
                    <span className="font-medium">30 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI Analysis</span>
                    <span className="font-medium">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Real-time Feedback</span>
                    <span className="font-medium">Enabled</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Evaluation Criteria</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Technical Skills</span>
                    <span className="font-medium">40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Communication</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Problem Solving</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cultural Fit</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Customize AI Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InterviewAI;
