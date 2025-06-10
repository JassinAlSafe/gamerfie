import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import GoalProgress from "./GoalProgress";
import TeamManagement from "./TeamManagement";
import TeamLeaderboard from "./TeamLeaderboard";
import ProgressHistory from "./ProgressHistory";
import {
  type Challenge,
} from "@/types/challenges";

interface ChallengeViewProps {
  challenge: Challenge;
  userTeamId?: string;
  onUpdateProgress: (goalId: string, progress: number) => Promise<void>;
  onCreateTeam: (name: string) => Promise<void>;
  onJoinTeam: (teamId: string) => Promise<void>;
  onLeaveTeam: () => Promise<void>;
}

export default function ChallengeView({
  challenge,
  userTeamId,
  onUpdateProgress,
  onCreateTeam,
  onJoinTeam,
  onLeaveTeam,
}: ChallengeViewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  // Calculate overall progress
  const overallProgress =
    challenge.goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) /
    (challenge.goals.length || 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{challenge.title}</h1>
        <p className="text-gray-500">{challenge.description}</p>
      </div>

      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Goals</h3>
            <p className="text-2xl font-bold">{challenge.goals.length}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Teams</h3>
            <p className="text-2xl font-bold">{challenge.teams.length}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Overall Progress
            </h3>
            <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
          </div>
        </div>
        <Progress value={overallProgress} className="mt-4" />
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Challenge Progress
                </h3>
                <div className="space-y-4">
                  {challenge.goals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">
                          {goal.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {Math.round(goal.progress || 0)}%
                        </p>
                      </div>
                      <Progress value={goal.progress || 0} />
                    </div>
                  ))}
                </div>
              </div>

              {challenge.type === "competitive" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Top Teams</h3>
                  <TeamLeaderboard
                    teams={challenge.teams}
                    userTeamId={userTeamId}
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <GoalProgress
            goals={challenge.goals}
            onUpdateProgress={onUpdateProgress}
            onSelectGoal={setSelectedGoal}
          />
        </TabsContent>

        <TabsContent value="teams">
          <TeamManagement
            teams={challenge.teams}
            userTeamId={userTeamId}
            onCreateTeam={onCreateTeam}
            onJoinTeam={onJoinTeam}
            onLeaveTeam={onLeaveTeam}
          />
        </TabsContent>

        <TabsContent value="leaderboard">
          <TeamLeaderboard teams={challenge.teams} userTeamId={userTeamId} />
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Progress History</h3>
                {challenge.goals.length > 1 && (
                  <select
                    className="text-sm border rounded-md p-2"
                    value={selectedGoal || ""}
                    onChange={(e) => setSelectedGoal(e.target.value || null)}
                  >
                    <option value="">All Goals</option>
                    {challenge.goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.description}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <ProgressHistory
                challengeId={challenge.id}
                goalId={selectedGoal || undefined}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
