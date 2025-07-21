
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Clock, Target, Award } from 'lucide-react';

const Analytics = () => {
  const metrics = [
    {
      title: 'Hiring Velocity',
      value: '18 days',
      change: '-3 days',
      trend: 'positive',
      icon: Clock,
      description: 'Average time to hire',
    },
    {
      title: 'Application Rate',
      value: '247',
      change: '+12%',
      trend: 'positive', 
      icon: Users,
      description: 'Applications this month',
    },
    {
      title: 'Interview Success',
      value: '68%',
      change: '+5%',
      trend: 'positive',
      icon: Target,
      description: 'Interview to offer ratio',
    },
    {
      title: 'Offer Acceptance',
      value: '85%',
      change: '+2%',
      trend: 'positive',
      icon: Award,
      description: 'Offer acceptance rate',
    },
  ];

  const sourceData = [
    { source: 'LinkedIn', candidates: 89, percentage: 36 },
    { source: 'Indeed', candidates: 67, percentage: 27 },
    { source: 'Company Website', candidates: 45, percentage: 18 },
    { source: 'Referrals', candidates: 32, percentage: 13 },
    { source: 'Other', candidates: 14, percentage: 6 },
  ];

  const positionData = [
    { position: 'Frontend Developer', applications: 78, hired: 12 },
    { position: 'Backend Engineer', applications: 65, hired: 8 },
    { position: 'Full Stack Developer', applications: 54, hired: 7 },
    { position: 'DevOps Engineer', applications: 32, hired: 5 },
    { position: 'UI/UX Designer', applications: 18, hired: 3 },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track your recruitment performance and insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title} className="bg-white/70 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </CardTitle>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-green-600 font-medium">
                      {metric.change}
                    </span>
                    <span className="text-xs text-gray-500">vs last month</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{metric.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Application Sources */}
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Application Sources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sourceData.map((item) => (
                  <div key={item.source} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{item.source}</span>
                      <span className="text-sm text-gray-600">{item.candidates} candidates</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">{item.percentage}% of total</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Position Performance */}
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Position Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positionData.map((item) => (
                  <div key={item.position} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.position}</h4>
                      <p className="text-sm text-gray-600">
                        {item.applications} applications • {item.hired} hired
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round((item.hired / item.applications) * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">success rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends Placeholder */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Charts Coming Soon</h3>
                <p className="text-gray-600">
                  Detailed trend analysis and interactive visualizations will be available here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">This Month</p>
                  <p className="text-2xl font-bold">35 Hires</p>
                </div>
                <Award className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Pipeline</p>
                  <p className="text-2xl font-bold">89 Active</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Efficiency</p>
                  <p className="text-2xl font-bold">92% Score</p>
                </div>
                <Target className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
