export interface MacroRatio {
  carb: number;     // e.g. 40
  protein: number;  // e.g. 30
  fat: number;      // e.g. 30
}

export interface DailyMealItem {
  id: string;
  mealName: string;      // "Bữa sáng", "Bữa phụ sáng", "Bữa trưa", "Bữa phụ chiều", "Bữa tối"
  foods: string;         // "Bún bò, 1 quả trứng"
  calories: number;      // 450
  protein: number;       // 25.0
  carb: number;          // 50.0
  fat: number;           // 15.0
}

export type PlanStatus = 'ACTIVE' | 'DRAFT' | 'COMPLETED';

export interface NutritionPlan {
  id: string;
  title: string;              // "Kế hoạch siết cơ 4 tuần - Nguyễn Văn A"
  clientName?: string;
  status: PlanStatus;
  targetCalories: number;     // 2200
  macros: MacroRatio;
  createdAt: string;          // "10/11/2026"
  meals: DailyMealItem[];
  note?: string;
}

export interface NutritionTemplate {
  id: string;
  title: string;              // "Giảm mỡ - Thâm hụt calo"
  calorieEstimate: string;    // "2200 kcal/macros có ước tính"
  targetCalories: number;
  macros: MacroRatio;
  imageUrl: string;
  defaultMeals: DailyMealItem[];
}

export interface WorkoutExerciseItem {
  id: string;
  exerciseName: string;
  setsReps: string;
  rpeRest: string;
  notes?: string;
}

export interface WorkoutDayItem {
  id: string;
  dayName: string;            // "Buổi 1: Ngực & Tay sau"
  targetMuscle: string;       // "Ngực, Tay sau"
  exercises: WorkoutExerciseItem[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  clientName?: string;
  status: PlanStatus;
  sessionsPerWeek: number;
  durationMinutes: number;
  createdAt: string;
  days: WorkoutDayItem[];
  note?: string;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  description: string;
  sessionsPerWeek: number;
  imageUrl: string;
  days: WorkoutDayItem[];
}

