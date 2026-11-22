export type NutritionPlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type MealType =
  | 'BREAKFAST'
  | 'MORNING_SNACK'
  | 'LUNCH'
  | 'AFTERNOON_SNACK'
  | 'DINNER'
  | 'EVENING_SNACK';

export interface DailyMacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionFood {
  id: string;
  mealType: MealType;
  foodName: string;
  quantity: number;
  unit?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
}

export interface NutritionMacroSummary {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  caloriesPercentage: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
}

export interface NutritionPlan {
  id: string;
  trainerId: string;
  clientId: string;
  clientName?: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: NutritionPlanStatus;
  dailyMacroTarget?: DailyMacroTarget;
  foods: NutritionFood[];
  macroSummary?: NutritionMacroSummary;
  createdAt: string;
  updatedAt: string;
}

// Request DTOs
export interface CreateNutritionPlanRequest {
  clientId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: NutritionPlanStatus;
  dailyMacroTarget?: DailyMacroTarget;
  foods?: Omit<NutritionFood, 'id'>[];
}

export interface UpdateNutritionPlanRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: NutritionPlanStatus;
}

export interface NutritionFoodRequest {
  mealType: MealType;
  foodName: string;
  quantity: number;
  unit?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
}

export interface UpdateNutritionFoodRequest {
  mealType?: MealType;
  foodName?: string;
  quantity?: number;
  unit?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  note?: string;
}

export interface UpdateMacroTargetRequest {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Meal Configuration Constants
export const MEAL_TYPES: MealType[] = [
  'BREAKFAST',
  'MORNING_SNACK',
  'LUNCH',
  'AFTERNOON_SNACK',
  'DINNER',
  'EVENING_SNACK',
];

export const MEAL_TYPE_CONFIG: Record<
  MealType,
  { label: string; emoji: string; color: string; badgeClass: string; desc: string }
> = {
  BREAKFAST: {
    label: 'Bữa sáng',
    emoji: '🌅',
    color: 'text-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    desc: 'Cung cấp năng lượng khởi động ngày mới',
  },
  MORNING_SNACK: {
    label: 'Bữa phụ sáng',
    emoji: '🥪',
    color: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    desc: 'Bữa nhẹ giữa buổi sáng duy trì trao đổi chất',
  },
  LUNCH: {
    label: 'Bữa trưa',
    emoji: '☀️',
    color: 'text-orange-400',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    desc: 'Bữa chính nạp đạm và tinh bột phục hồi cơ',
  },
  AFTERNOON_SNACK: {
    label: 'Bữa phụ chiều',
    emoji: '🍎',
    color: 'text-rose-400',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    desc: 'Nạp năng lượng trước khi tập luyện',
  },
  DINNER: {
    label: 'Bữa tối',
    emoji: '🌙',
    color: 'text-indigo-400',
    badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    desc: 'Bữa tối nhẹ nhàng, giàu đạm và rau xanh',
  },
  EVENING_SNACK: {
    label: 'Bữa phụ tối',
    emoji: '🥛',
    color: 'text-teal-400',
    badgeClass: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    desc: 'Casein/Sữa ấm hỗ trợ phục hồi cơ ban đêm',
  },
};

export const NUTRITION_PLAN_STATUS_CONFIG: Record<
  NutritionPlanStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  ACTIVE: {
    label: 'Đang áp dụng',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
  },
  DRAFT: {
    label: 'Bản nháp',
    badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    dotClass: 'bg-slate-400',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-400',
  },
  CANCELLED: {
    label: 'Đã hủy',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-400',
  },
};

