"use client";

import { useState } from 'react';
import { Info } from 'lucide-react';

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

type Tooltip = {
  visible: boolean;
  content: string;
  position: { x: number; y: number };
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
};

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
  const [tooltip, setTooltip] = useState<Tooltip>({
    visible: false,
    content: '',
    position: { x: 0, y: 0 }
  });

  // ... [Previous calculation code remains the same] ...

  const showTooltip = (e: React.MouseEvent, content: string) => {
    setTooltip({
      visible: true,
      content,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
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
      {/* [Previous form HTML remains similar, adding condition checkboxes] */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Medical Conditions</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(CONDITION_ADJUSTMENTS).map(condition => (
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

      {/* Results section with tooltips */}
      {results && (
        <div className="mt-6 space-y-4">
          {/* ... [Previous results sections with added tooltips] ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Each section gets Info icon and tooltip */}
            <div className="p-4 bg-gray-50 rounded relative">
              <div className="flex items-center">
                <h4 className="font-medium">Anthropometrics</h4>
                <Info 
                  className="ml-2 w-4 h-4 cursor-help" 
                  onMouseEnter={(e) => showTooltip(e, TOOLTIPS.bmi)}
                  onMouseLeave={hideTooltip}
                />
              </div>
              {/* ... results content ... */}
            </div>
            
            {/* Condition-specific adjustments when conditions are selected */}
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
        </div>
      )}

      {/* Clinical References Section */}
      <div className="mt-8 bg-gray-50 p-4 rounded">
        <h4 className="font-medium mb-2">Evidence-Based References</h4>
        <div className="text-sm space-y-2">
          <p><strong>Protein Recommendations:</strong></p>
          <ul className="list-disc pl-4">
            <li>Leidy et al. (2015) - Systematic review supporting 1.2-1.6g/kg for weight loss</li>
            <li>AND/AACE/TOS Guidelines - Minimum 60g/day protein</li>
            <li>ASPEN Guidelines for Obesity (2016)</li>
          </ul>
          
          <p><strong>Energy Calculations:</strong></p>
          <ul className="list-disc pl-4">
            <li>Mifflin-St. Jeor equation - Most accurate for obesity (Frankenfield et al., 2005)</li>
            <li>Activity factors validated in systematic review (McMurray et al., 2014)</li>
          </ul>

          <p><strong>Clinical Guidelines:</strong></p>
          <ul className="list-disc pl-4">
            <li>Academy of Nutrition and Dietetics Evidence Analysis Library</li>
            <li>AACE/ACE Guidelines for Obesity Management (2016)</li>
            <li>KDIGO Guidelines for CKD (2020)</li>
            <li>ADA Standards of Care (2023)</li>
          </ul>
        </div>
      </div>

      {/* Tooltip display */}
      {tooltip.visible && (
        <div 
          className="fixed bg-black text-white p-2 rounded text-sm max-w-xs z-50"
          style={{
            left: tooltip.position.x + 10,
            top: tooltip.position.y + 10
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
