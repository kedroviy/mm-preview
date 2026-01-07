"use client";

import { Button } from "@mm-preview/ui";
import { Card } from "primereact/card";

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Welcome to Dashboard!</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Movies" className="h-full">
            <p className="m-0">Browse and discover new movies</p>
            <Button className="mt-4">Explore</Button>
          </Card>

          <Card title="Recommendations" className="h-full">
            <p className="m-0">Get personalized movie recommendations</p>
            <Button className="mt-4" outlined>
              View
            </Button>
          </Card>

          <Card title="Watchlist" className="h-full">
            <p className="m-0">Manage your watchlist</p>
            <Button className="mt-4" text>
              Manage
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
