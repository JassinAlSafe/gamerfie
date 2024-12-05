import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function ProfileError() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-red-500">
            <AlertCircle className="mr-2" />
            Error Loading Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            There was an error loading your profile. Please try again later or
            contact support if the problem persists.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
