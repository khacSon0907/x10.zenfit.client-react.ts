import { useState, useEffect } from 'react';
import { X, Utensils, Flame, Loader2, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import type { MealType, NutritionFood } from '../../types/nutrition';
import { MEAL_TYPES, MEAL_TYPE_CONFIG } from '../../types/nutrition';
import nutritionPlanService from '../../services/nutritionPlanService';

interface FoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  defaultMealType?: MealType;
  foodToEdit?: NutritionFood | null;
  onSaved: (food: NutritionFood) => void;
}

const COMMON_UNITS = ['g', 'quả', 'chén', 'bát', 'lát', 'ml', 'muỗng', 'hộp'];

export default function FoodModal({
  isOpen,
  onClose,
  planId,
  defaultMealType = 'BREAKFAST',
  foodToEdit,
  onSaved,
}: FoodModalProps) {
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [foodName, setFoodName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<string>('g');
  const [calories, setCalories] = useState<number>(150);
  const [protein, setProtein] = useState<number>(10);
  const [carbs, setCarbs] = useState<number>(15);
  const [fat, setFat] = useState<number>(5);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (foodToEdit) {
        setMealType(foodToEdit.mealType);
        setFoodName(foodToEdit.foodName);
        setQuantity(foodToEdit.quantity || 100);
        setUnit(foodToEdit.unit || 'g');
        setCalories(foodToEdit.calories || 0);
        setProtein(foodToEdit.protein || 0);
        setCarbs(foodToEdit.carbs || 0);
        setFat(foodToEdit.fat || 0);
        setNote(foodToEdit.note || '');
      } else {
        setMealType(defaultMealType);
        setFoodName('');
        setQuantity(100);
        setUnit('g');
        setCalories(150);
        setProtein(15);
        setCarbs(15);
        setFat(3);
        setNote('');
      }
    }
  }, [isOpen, foodToEdit, defaultMealType]);

  if (!isOpen) return null;

  const autoCalcCalories = () => {
    const calc = protein * 4 + carbs * 4 + fat * 9;
    setCalories(Math.round(calc));
    toast.info(`Đã tính Calo từ Macro: ${Math.round(calc)} kcal`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      toast.error('Vui lòng nhập tên món ăn.');
      return;
    }
    if (quantity <= 0) {
      toast.error('Khẩu phần/Số lượng phải lớn hơn 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (foodToEdit) {
        const updated = await nutritionPlanService.updateFood(planId, foodToEdit.id, {
          mealType,
          foodName: foodName.trim(),
          quantity: Number(quantity),
          unit: unit.trim() || undefined,
          calories: Number(calories),
          protein: Number(protein),
          carbs: Number(carbs),
          fat: Number(fat),
          note: note.trim() || undefined,
        });
        toast.success(`Cập nhật món "${foodName}" thành công!`);
        onSaved(updated);
      } else {
        const added = await nutritionPlanService.addFood(planId, {
          mealType,
          foodName: foodName.trim(),
          quantity: Number(quantity),
          unit: unit.trim() || undefined,
          calories: Number(calories),
          protein: Number(protein),
          carbs: Number(carbs),
          fat: Number(fat),
          note: note.trim() || undefined,
        });
        toast.success(`Đã thêm món "${foodName}" vào ${MEAL_TYPE_CONFIG[mealType].label}!`);
        onSaved(added);
      }
      onClose();
    } catch (err: unknown) {
      console.error('Lỗi khi lưu món ăn:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || 'Không thể lưu món ăn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0c1626] border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-100 overflow-hidden">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
            <Utensils className="w-3.5 h-3.5" />
            <span>{foodToEdit ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {foodToEdit ? `Chỉnh sửa: ${foodToEdit.foodName}` : 'Thêm món ăn vào thực đơn'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Chi tiết thành phần dinh dưỡng và khẩu phần ăn cho bữa ăn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chọn Bữa ăn (Meal Type) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Bữa ăn áp dụng <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MEAL_TYPES.map((type) => {
                const conf = MEAL_TYPE_CONFIG[type];
                const isSelected = mealType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition text-left cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-xs'
                        : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-base">{conf.emoji}</span>
                    <span className="truncate">{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tên món ăn */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Tên món ăn / Thực phẩm <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Ức gà áp chảo, Yến mạch chuối, Bông cải xanh..."
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Khẩu phần & Đơn vị tính */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Khẩu phần / Số lượng <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Đơn vị tính (g, quả, bát...)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="g"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Gợi ý đơn vị nhanh */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400">Gợi ý đơn vị:</span>
            {COMMON_UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition cursor-pointer ${
                  unit === u
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Dinh dưỡng: Calo + Macro */}
          <div className="pt-2 border-t border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Giá trị dinh dưỡng theo khẩu phần</span>
              </label>
              <button
                type="button"
                onClick={autoCalcCalories}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline cursor-pointer"
                title="Tự tính Calo = P*4 + C*4 + F*9"
              >
                <Calculator className="w-3 h-3" />
                <span>Tính Calo</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {/* Calo */}
              <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/30 text-center">
                <span className="text-[10px] text-amber-400 font-bold block mb-1">Calories</span>
                <input
                  type="number"
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full text-center bg-slate-800 border border-slate-700 rounded-md py-1 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[9px] text-slate-400 mt-0.5 block">kcal</span>
              </div>

              {/* Protein */}
              <div className="p-2 rounded-xl bg-slate-900/90 border border-rose-500/30 text-center">
                <span className="text-[10px] text-rose-400 font-bold block mb-1">Protein</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full text-center bg-slate-800 border border-slate-700 rounded-md py-1 text-xs font-bold text-white focus:outline-none focus:border-rose-500"
                />
                <span className="text-[9px] text-slate-400 mt-0.5 block">gram</span>
              </div>

              {/* Carbs */}
              <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/30 text-center">
                <span className="text-[10px] text-amber-300 font-bold block mb-1">Carbs</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full text-center bg-slate-800 border border-slate-700 rounded-md py-1 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[9px] text-slate-400 mt-0.5 block">gram</span>
              </div>

              {/* Fat */}
              <div className="p-2 rounded-xl bg-slate-900/90 border border-purple-500/30 text-center">
                <span className="text-[10px] text-purple-400 font-bold block mb-1">Fat</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  className="w-full text-center bg-slate-800 border border-slate-700 rounded-md py-1 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
                />
                <span className="text-[9px] text-slate-400 mt-0.5 block">gram</span>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Ghi chú chế biến / lưu ý
            </label>
            <input
              type="text"
              placeholder="VD: Luộc chín không nêm muối, ăn trước tập 45 phút..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{foodToEdit ? 'Lưu thay đổi' : 'Thêm món ăn'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

