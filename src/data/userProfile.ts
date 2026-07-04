// Height/weight already live in context/UserProfileContext.tsx (backed by
// AsyncStorage under '@user_profile'). This file only holds the BMI math,
// since BMI itself isn't a stored field — it's derived from height + weight.

// BMI = weight(kg) / (height(m))^2
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  return weightKg / (heightM * heightM);
}

export function bmiCategory(bmi: number): string {
  if (bmi <= 0) return '—';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}
