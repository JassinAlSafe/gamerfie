import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/types/profile";

interface AboutSectionProps {
  profile: Profile;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-white">About</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300">
          {profile.bio || "No bio provided yet. Click 'Edit Profile' to add one!"}
        </p>
      </CardContent>
    </Card>
  );
};