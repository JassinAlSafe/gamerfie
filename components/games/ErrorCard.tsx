
import { Card, CardContent } from "@/components/ui/card";

export function ErrorCard({ error }: { error: { message: string } }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="p-6">
        <CardContent className="text-center">
          <h3 className="text-lg font-semibold mb-2">Error loading games</h3>
          <p className="text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    </div>
  );
}