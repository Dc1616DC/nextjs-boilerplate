"use client";

import { useState } from 'react';

export default function NutritionCalculator() {
  const [formData, setFormData] = useState({
    age: '',
    weightLbs: '',
    heightFeet: '',
    heightInches: '',
    gender: 'female',
    activityLevel: 'light',
    comorbidities: [],
    weightLossGoal: 'moderate'
  });

  const [results, setResults] = useState(null);

  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725
  };

  const calculateResults = () => {
    // Convert height to cm
    const heightInCm = ((parseInt(formData.heightFeet) * 12) + parseInt(formData.heightInches)) * 2.54;
    // Convert weight to kg
    const weightInKg = parseFloat(formData.weightLbs) * 0.45359237;

    // Calculate BMR using Mifflin-St. Jeor
    let bmr;
    if (formData.gender === 'female') {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * formData.age) - 161;
    } else {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * formData.age) + 5;
    }

    // Calculate TDEE
    const tdee = bmr * activityFactors[formData.activityLevel];

    // Calculate target calories based on weight loss goal
    const calorieDeficits = {
      conservative: 250,
      moderate: 500,
      aggressive: 750
    };
    const targetCalories = tdee - calorieDeficits[formData.weightLossGoal];

    // Calculate IBW
    const baseHeight = 5 * 12; // 5 feet in inches
    const actualHeight = (parseInt(formData.heightFeet) * 12) + parseInt(formData.heightInches);
    const inchesOver5Feet = actualHeight - baseHeight;
    const ibwLbs = formData.gender === 'female' ? 
      100 + (inchesOver5Feet * 5) :
      106 + (inchesOver5Feet * 6);

    // Calculate ABW if needed
    let abwLbs = ibwLbs;
    if (formData.weightLbs > (ibwLbs * 1.2)) {
      abwLbs = ibwLbs + (0.4 * (formData.weightLbs - ibwLbs));
    }

    // Calculate protein needs
    const abwKg = abwLbs * 0.45359237;
    const proteinLow = Math.round(abwKg * 1.2);
    const proteinHigh = Math.round(abwKg * 1.6);

    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      proteinRange: `${proteinLow}-${proteinHigh}`,
      ibw: Math.round(ibwLbs),
      abw: Math.round(abwLbs)
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={(e) => { e.preventDefault(); calculateResults(); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={formData.age}
              onChange={e => setFormData({...formData, age: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Weight (lbs)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={formData.weightLbs}
              onChange={e => setFormData({...formData, weightLbs: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Height (feet)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={formData.heightFeet}
              onChange={e => setFormData({...formData, heightFeet: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Height (inches)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={formData.heightInches}
              onChange={e => setFormData({...formData, heightInches: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value})}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Activity Level</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.activityLevel}
              onChange={e => setFormData({...formData, activityLevel: e.target.value})}
            >
              <option value="sedentary">Sedentary (little/no exercise)</option>
              <option value="light">Lightly Active (1-3 days/week)</option>
              <option value="moderate">Moderately Active (3-5 days/week)</option>
              <option value="very">Very Active (6-7 days/week)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Weight Loss Goal</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.weightLossGoal}
              onChange={e => setFormData({...formData, weightLossGoal: e.target.value})}
            >
              <option value="conservative">Conservative (0.5 lb/week)</option>
              <option value="moderate">Moderate (1 lb/week)</option>
              <option value="aggressive">Aggressive (1.5 lb/week)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Calculate
        </button>
      </form>

      {results && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <h4 className="font-medium">Energy Needs</h4>
              <p>BMR: {results.bmr} calories</p>
              <p>TDEE: {results.tdee} calories</p>
              <p>Target Calories: {results.targetCalories} calories</p>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h4 className="font-medium">Body Weight Goals</h4>
              <p>Ideal Body Weight: {results.ibw} lbs</p>
              <p>Adjusted Body Weight: {results.abw} lbs</p>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h4 className="font-medium">Protein Needs</h4>
              <p>Recommended Range: {results.proteinRange}g/day</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
