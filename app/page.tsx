"use client";

import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Nutrition Calculator for Weight Loss</h1>
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <div className="p-6">
              <NutritionCalculator />
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
