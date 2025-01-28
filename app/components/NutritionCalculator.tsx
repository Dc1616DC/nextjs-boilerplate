"use client";

import { useState } from 'react';

type FormData = {
  age: string;
  weightLbs: string;
  heightFeet: string;
  heightInches: string;
  gender: string;
  activityLevel: string;
  conditions: string[];
  weightLossGoal: string;
}

type Results = {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinRange: string;
  ibw: number;
  abw: number;
  bmi: number;
  adjustmentFactor: number;
  macroDistribution: {
    protein: string;
    carbs: string;
    fat: string;
  };
  conditionAdjustments: {
    protein: string;
    calories: string;
    notes: string;
  }
}

const CONDITION_ADJUSTMENTS = {
  diabetes: {
    protein: "1.2-1.5g/kg ABW",
    calories: "-500 kcal from TDEE",
    notes: "Monitor carbohydrate distribution; consider 45-50% complex carbs",
    macros: { protein: "20-25%", carbs: "45-50%", fat: "25-30%" }
  },
  kidney: {
    protein: "0.6-0.8g/kg ABW (non-dialysis)",
    calories: "30-35 kcal/kg IBW",
    notes: "Monitor electrolytes; consider renal dietitian referral",
    macros: { protein: "15-20%", carbs: "50-60%", fat: "25-30%" }
  },
  hypertension: {
    protein: "1.2-1.4g/kg ABW",
    calories: "-500 to -750 kcal from TDEE",
    notes: "Follow DASH diet principles; sodium <2300mg",
    macros: { protein: "18-22%", carbs: "50-55%", fat: "25-30%" }
  },
  liver: {
    protein: "1.2-1.5g/kg ABW",
    calories: "30-35 kcal/kg ABW",
    notes: "Monitor ammonia levels; consider BCAA supplementation",
    macros: { protein: "20-25%", carbs: "45-50%", fat: "25-30%" }
  }
} as const;

const TOOLTIPS = {
  bmi: "Body Mass Index calculation based on WHO standards. BMI = weight(kg)/height(m)²",
  ibw: "Ideal Body Weight calculated using Hamwi equation: Female: 100lb + 5lb/inch >5ft; Male: 106lb + 6lb/inch >5ft",
  abw: "Adjusted Body Weight uses sliding scale based on BMI ranges to account for metabolically active tissue",
  protein: "Based on Leidy et al. (2015) systematic review showing improved outcomes with 1.2-1.6g/kg protein during weight loss",
  energy: "Mifflin-St. Jeor equation validated for individuals with obesity. Includes activity and thermogenic adjustments",
  conditions: "Medical condition adjustments based on AND/ASPEN guidelines and clinical evidence"
};

export default function NutritionCalculator() {
  const [formData, setFormData] = useState<FormData>({
    age: '',
    weightLbs: '',
    heightFeet: '',
    heightInches: '',
    gender: 'female',
    activityLevel: 'light',
    conditions: [],
    weightLossGoal: 'moderate'
  });

  const [results, setResults] = useState<Results | null>(null);
  const [showReferences, setShowReferences] = useState(false);

  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725
  } as const;

  const calculateResults = () => {
    // Convert measurements
    const heightInInches = (parseInt(formData.heightFeet) * 12) + parseInt(formData.heightInches);
    const heightInCm = heightInInches * 2.54;
    const heightInMeters = heightInCm / 100;
    const weightInKg = parseFloat(formData.weightLbs) * 0.45359237;
    const age = parseInt(formData.age);

    // Calculate BMI
    const bmi = weightInKg / (heightInMeters * heightInMeters);

    // Calculate IBW (Hamwi equation)
    const baseHeight = 5 * 12; // 5 feet in inches
    const inchesOver5Feet = heightInInches - baseHeight;
    const ibwLbs = formData.gender === 'female' ? 
      100 + (inchesOver5Feet * 5) :
      106 + (inchesOver5Feet * 6);
    const ibwKg = ibwLbs * 0.45359237;

    // Determine adjustment factor based on BMI
    let adjustmentFactor = 0.40; // default
    if (bmi > 40) adjustmentFactor = 0.25;
    else if (bmi > 35) adjustmentFactor = 0.30;
    else if (bmi > 30) adjustmentFactor = 0.35;

    // Calculate Adjusted Body Weight
    const excessWeightKg = weightInKg - ibwKg;
    const adjustedWeightKg = ibwKg + (adjustmentFactor * excessWeightKg);

    // Calculate BMR using Mifflin-St. Jeor
    let bmr;
    if (formData.gender === 'female') {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) - 161;
    } else {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) + 5;
    }

    // Calculate TDEE
    const tdee = bmr * activityFactors[formData.activityLevel as keyof typeof activityFactors];

    // Calculate protein needs using adjusted weight
    const proteinLow = Math.round(adjustedWeightKg * 1.2);
    const proteinHigh = Math.round(adjustedWeightKg * 1.6);

    // Calculate calorie target
    const calorieDeficits = {
      conservative: 250,
      moderate: 500,
      aggressive: 750
    };
    
    const targetCalories = tdee - calorieDeficits[formData.weightLossGoal as keyof typeof calorieDeficits];

    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      proteinRange: `${proteinLow}-${proteinHigh}`,
      ibw: Math.round(ibwLbs),
      abw: Math.round(adjustedWeightKg * 2.20462), // convert to lbs
      bmi: Math.round(bmi * 10) / 10,
      adjustmentFactor,
      macroDistribution: {
        protein: "25-30%",
        carbs: "45-50%",
        fat: "25-30%"
      },
      conditionAdjustments: {
        protein: "",
        calories: "",
        notes: ""
      }
    });
  };

  const handleConditionChange = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }));
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

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Medical Conditions</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(CONDITION_ADJUSTMENTS) as Array<keyof typeof CONDITION_ADJUSTMENTS>).map(condition => (
              <label key={condition} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.conditions.includes(condition)}
                  onChange={() => handleConditionChange(condition)}
                  className="form-checkbox"
                />
                <span className="capitalize">{condition}</span>
              </label>
            ))}
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
              <div className="flex items-center">
                <h4 className="font-medium">Anthropometrics</h4>
                <button
                  className="ml-2 px-2 py-1 text-blue-600 hover:bg-blue-100 rounded-full"
                  title={TOOLTIPS.bmi}
                >
                  ℹ
                </button>
              </div>
              <p>BMI: {results.bmi} kg/m²</p>
              <p>Ideal Body Weight: {results.ibw} lbs</p>
              <p>Adjusted Body Weight: {results.abw} lbs</p>
              <p className="text-sm text-gray-600 mt-1">Adjustment Factor: {results.adjustmentFactor}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <div className="flex items-center">
                <h4 className="font-medium">Energy Needs</h4>
                <button
                  className="ml-2 px-2 py-1 text-blue-600 hover:bg-blue-100 rounded-full"
                  title={TOOLTIPS.energy}
                >
                  ℹ
                </button>
              </div>
              <p>BMR: {results.bmr} calories</p>
              <p>TDEE: {results.tdee} calories</p>
              <p>Target Calories: {results.targetCalories} calories</p>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <div className="flex items-center">
                <h4 className="font-medium">Protein Needs</h4>
                <button
                  className="ml-2 px-2 py-1 text-blue-600 hover:bg-blue-100 rounded-full"
                  title={TOOLTIPS.protein}
                >
                  ℹ
                </button>
              </div>
              <p>Recommended Range: {results.proteinRange}g/day</p>
              <p className="text-sm text-gray-600 mt-1">Based on 1.2-1.6g/kg adjusted body weight</p>
            </div>

            {formData.conditions.length > 0 && (
              <div className="col-span-2 p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Condition-Specific Adjustments</h4>
                {formData.conditions.map(condition => (
                  <div key={condition} className="mb-4">
                    <h5 className="font-medium capitalize">{condition}</h5>
                    <ul className="text-sm">
                      <li>Protein: {CONDITION_ADJUSTMENTS[condition as keyof typeof CONDITION_ADJUSTMENTS].protein}</li>
                      <li>Calories: {CONDITION_ADJUSTMENTS[condition as keyof typeof CONDITION_ADJUSTMENTS].calories}</li>
                      <li>Note: {CONDITION_ADJUSTMENTS[condition as keyof typeof CONDITION_ADJUSTMENTS].notes}</li>
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        
          {/* Clinical References Section */
           <div className="mt-8">
            <button 
              onClick={() => setShowReferences(!showReferences)}
              className="w-full bg-gray-100 p-4 rounded flex justify-between items-center hover:bg-gray-200"
            >
              <span className="font-medium">Evidence-Based References</span>
              <span>{showReferences ? '−' : '+'}</span>
            </button>
            
            {showReferences && (
              <div className="mt-2 bg-gray-50 p-4 rounded border">
                <div className="text-sm space-y-2">
                  <p className="font-semibold">Protein Recommendations:</p>
                  <ul className="list-disc pl-4 mb-4">
                    <li>Leidy et al. (2015) - Systematic review supporting 1.2-1.6g/kg for weight loss</li>
                    <li>AND/AACE/TOS Guidelines - Minimum 60g/day protein</li>
                    <li>ASPEN Guidelines for Obesity (2016)</li>
                  </ul>
                  
                  <p className="font-semibold">Energy Calculations:</p>
                  <ul className="list-disc pl-4 mb-4">
                    <li>Mifflin-St. Jeor equation - Most accurate for obesity (Frankenfield et al., 2005)</li>
                    <li>Activity factors validated in systematic review (McMurray et al., 2014)</li>
                  </ul>

                  <p className="font-semibold">Clinical Guidelines:</p>
                  <ul className="list-disc pl-4">
                    <li>Academy of Nutrition and Dietetics Evidence Analysis Library</li>
                    <li>AACE/ACE Guidelines for Obesity Management (2016)</li>
                    <li>KDIGO Guidelines for CKD (2020)</li>
                    <li>ADA Standards of Care (2023)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
