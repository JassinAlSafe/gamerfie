import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-6 w-32 mt-4 bg-gray-200 animate-pulse" />
                <div className="h-4 w-24 mt-2 bg-gray-200 animate-pulse" />
              </div>
            </CardContent>
          </Card>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Game Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-20 mb-2 bg-gray-200 animate-pulse" />
                    <div className="h-6 w-12 bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-4">
                  <div className="h-4 w-24 mb-2 bg-gray-200 animate-pulse" />
                  <div className="h-6 w-full bg-gray-200 animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
