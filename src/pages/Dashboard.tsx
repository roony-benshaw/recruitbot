
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const stats = [
    {
      title: 'Total Candidates',
      value: '247',
      change: '+12%',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Resumes Parsed',
      value: '189',
      change: '+8%',
      icon: FileText,
      color: 'from-teal-500 to-teal-600',
    },
    {
      title: 'Interviews Scheduled',
      value: '34',
      change: '+23%',
      icon: Calendar,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Offers Extended',
      value: '12',
      change: '+15%',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New candidate application received',
      candidate: 'Sarah Johnson',
      time: '2 minutes ago',
      type: 'application',
    },
    {
      id: 2,
      action: 'Interview scheduled',
      candidate: 'Michael Chen',
      time: '15 minutes ago',
      type: 'interview',
    },
    {
      id: 3,
      action: 'Resume evaluation completed',
      candidate: 'Emily Davis',
      time: '1 hour ago',
      type: 'evaluation',
    },
    {
      id: 4,
      action: 'Candidate moved to shortlist',
      candidate: 'Alex Rodriguez',
      time: '2 hours ago',
      type: 'shortlist',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's an overview of your recruitment activities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="bg-white/70 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-green-600 font-medium">
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-blue-50/50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">
                        {activity.action}
                      </p>
                      <p className="text-sm text-blue-600 font-medium">
                        {activity.candidate}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button
                  className="w-full text-left p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors"
                  onClick={() => navigate('/resume-parser')}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Parse New Resumes</h3>
                      <p className="text-sm text-gray-600">Upload and analyze candidate resumes</p>
                    </div>
                  </div>
                </button>

                <button
                  className="w-full text-left p-4 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg border border-teal-100 hover:border-teal-200 transition-colors"
                  onClick={() => navigate('/interviews')}
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Schedule Interviews</h3>
                      <p className="text-sm text-gray-600">Set up meetings with candidates</p>
                    </div>
                  </div>
                </button>

                <button
                  className="w-full text-left p-4 bg-gradient-to-r from-green-50 to-purple-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors"
                  onClick={() => navigate('/candidates')}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Review Candidates</h3>
                      <p className="text-sm text-gray-600">Evaluate and shortlist applicants</p>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
