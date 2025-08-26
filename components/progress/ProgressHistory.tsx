"use client";

/**
 * Progress History Visualization Components
 * Based on the documented progress tracking system
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Clock, Trophy, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ProgressDataPoint {
  date: string;
  hours: number;
  sessions?: number;
  achievements?: number;
  completionPercentage?: number;
}

export interface AchievementDataPoint {
  date: string;
  count: number;
  achievements: Array<{
    id: string;
    name: string;
    rarity: number;
  }>;
}

export interface ProgressHistoryProps {
  gameId: string;
  gameName: string;
  playTimeHistory: ProgressDataPoint[];
  achievementHistory: AchievementDataPoint[];
  totalPlayTime: number;
  totalAchievements: number;
  completionPercentage: number;
  className?: string;
}


export function ProgressHistory({
  playTimeHistory,
  achievementHistory,
  totalPlayTime,
  totalAchievements,
  completionPercentage,
  className
}: ProgressHistoryProps) {
  // Process data for visualizations
  const chartData = useMemo(() => {
    const combined = playTimeHistory.map(point => {
      const achievementPoint = achievementHistory.find(a => a.date === point.date);
      return {
        date: point.date,
        displayDate: new Date(point.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        hours: point.hours,
        cumulativeHours: 0, // Will be calculated below
        achievements: achievementPoint?.count || 0,
        sessions: point.sessions || 0,
        completion: point.completionPercentage || 0
      };
    });

    // Calculate cumulative hours
    let cumulative = 0;
    combined.forEach(point => {
      cumulative += point.hours;
      point.cumulativeHours = cumulative;
    });

    return combined;
  }, [playTimeHistory, achievementHistory]);

  // Calculate weekly averages
  const weeklyStats = useMemo(() => {
    if (chartData.length < 7) return null;

    const last7Days = chartData.slice(-7);
    const avgHoursPerDay = last7Days.reduce((sum, day) => sum + day.hours, 0) / 7;
    const avgSessionsPerDay = last7Days.reduce((sum, day) => sum + day.sessions, 0) / 7;
    
    return {
      avgHoursPerDay: Number(avgHoursPerDay.toFixed(1)),
      avgSessionsPerDay: Number(avgSessionsPerDay.toFixed(1)),
      totalWeekHours: Number(last7Days.reduce((sum, day) => sum + day.hours, 0).toFixed(1))
    };
  }, [chartData]);

  // Completion breakdown data
  const completionData = [
    { name: 'Completed', value: completionPercentage, color: '#10B981' },
    { name: 'Remaining', value: 100 - completionPercentage, color: '#374151' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'hours' || entry.dataKey === 'cumulativeHours' ? 'h' : ''}
              {entry.dataKey === 'completion' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Total Playtime</p>
                <p className="text-xl font-bold text-white">{totalPlayTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Achievements</p>
                <p className="text-xl font-bold text-white">{totalAchievements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Completion</p>
                <p className="text-xl font-bold text-white">{completionPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {weeklyStats && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Avg/Day (7d)</p>
                  <p className="text-xl font-bold text-white">{weeklyStats.avgHoursPerDay}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Visualization Tabs */}
      <Tabs defaultValue="playtime" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="playtime">Playtime</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="playtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Playtime</CardTitle>
              <CardDescription>
                Hours played per day over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="hours" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cumulative Playtime</CardTitle>
              <CardDescription>
                Total hours played over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="cumulativeHours" 
                    stroke="#06B6D4" 
                    fill="#06B6D4"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Unlocks</CardTitle>
              <CardDescription>
                Achievements unlocked over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="achievements" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievementHistory
                  .slice(-5)
                  .reverse()
                  .map((day, index) => 
                    day.achievements.map((achievement, achievementIndex) => (
                      <div key={`${index}-${achievementIndex}`} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Trophy className="h-5 w-5 text-yellow-400" />
                          <div>
                            <p className="font-medium text-white">{achievement.name}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(day.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {achievement.rarity}% earned
                        </Badge>
                      </div>
                    ))
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gaming Sessions</CardTitle>
              <CardDescription>
                Number of gaming sessions per day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sessions" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion Progress</CardTitle>
                <CardDescription>
                  Overall game completion percentage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Completion']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-4">
                  <p className="text-3xl font-bold text-white">{completionPercentage}%</p>
                  <p className="text-gray-400">Complete</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Over Time</CardTitle>
                <CardDescription>
                  Completion percentage progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="displayDate" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="completion" 
                      stroke="#10B981" 
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}