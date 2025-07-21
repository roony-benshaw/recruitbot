
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Users, FileText, Calendar, BarChart3 } from 'lucide-react';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              RecruitBot AI
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Revolutionize Your Hiring Process
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              AI-powered recruitment platform that streamlines candidate evaluation, 
              resume parsing, and interview scheduling.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Login Card */}
            <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">HR Portal Login</CardTitle>
                <CardDescription className="text-center">
                  Access your recruitment dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="hr@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-blue-200 focus:border-blue-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-blue-200 focus:border-blue-400"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                  >
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Features Overview */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Platform Features</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-white/60 rounded-lg border border-blue-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Candidate Management</h4>
                    <p className="text-gray-600 text-sm">Track and evaluate candidates with AI-powered scoring</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-white/60 rounded-lg border border-blue-100">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Resume Parser</h4>
                    <p className="text-gray-600 text-sm">Automatically extract and analyze resume data</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-white/60 rounded-lg border border-blue-100">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Interview Scheduling</h4>
                    <p className="text-gray-600 text-sm">Streamline interview coordination and management</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-white/60 rounded-lg border border-blue-100">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Analytics Dashboard</h4>
                    <p className="text-gray-600 text-sm">Track hiring metrics and performance insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
