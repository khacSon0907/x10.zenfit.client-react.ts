import * as XLSX from 'xlsx';
import type { NutritionPlan, MealType } from '../types/nutrition';
import { MEAL_TYPES, MEAL_TYPE_CONFIG } from '../types/nutrition';

/**
 * Xuất file Excel chuyên nghiệp, trình bày đẹp mắt cho Kế hoạch dinh dưỡng của học viên
 */
export function exportNutritionPlanToExcel(plan: NutritionPlan, clientName?: string) {
  const effectiveClientName = clientName || plan.clientName || 'Hoc_Vien';
  const target = plan.dailyMacroTarget || {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 60,
  };

  // Tính tổng thực nạp
  const foods = plan.foods || [];
  const totalCal = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
  const totalP = Math.round(foods.reduce((sum, f) => sum + (f.protein || 0), 0) * 10) / 10;
  const totalC = Math.round(foods.reduce((sum, f) => sum + (f.carbs || 0), 0) * 10) / 10;
  const totalF = Math.round(foods.reduce((sum, f) => sum + (f.fat || 0), 0) * 10) / 10;

  // =========================================================================
  // SHEET 1: THỰC ĐƠN CHI TIẾT 6 BỮA ĂN
  // =========================================================================
  const sheet1Data: (string | number)[][] = [];

  // Header Banner
  sheet1Data.push(['ZENFIT - BẢNG THỰC ĐƠN & KẾ HOẠCH DINH DƯỠNG CHI TIẾT']);
  sheet1Data.push(['']);
  sheet1Data.push(['Học viên:', effectiveClientName, '', 'Ngày xuất:', new Date().toLocaleDateString('vi-VN')]);
  sheet1Data.push(['Kế hoạch:', plan.name, '', 'Trạng thái:', plan.status]);
  sheet1Data.push([
    'Thời gian áp dụng:',
    `${plan.startDate ? new Date(plan.startDate).toLocaleDateString('vi-VN') : '---'} đến ${
      plan.endDate ? new Date(plan.endDate).toLocaleDateString('vi-VN') : '---'
    }`,
  ]);
  if (plan.description) {
    sheet1Data.push(['Mô tả / Lưu ý:', plan.description]);
  }
  sheet1Data.push(['']);

  // Bảng mục tiêu macro ngày
  sheet1Data.push(['MỤC TIÊU DINH DƯỠNG MỖI NGÀY (TARGET MACROS):']);
  sheet1Data.push(['Calo mục tiêu (kcal)', 'Chất đạm (Protein - g)', 'Tinh bột (Carbs - g)', 'Chất béo (Fat - g)']);
  sheet1Data.push([target.calories, `${target.protein}g`, `${target.carbs}g`, `${target.fat}g`]);
  sheet1Data.push(['']);

  // Chi tiết từng bữa ăn
  sheet1Data.push(['CHI TIẾT THỰC ĐƠN TỪNG BỮA TRONG NGÀY:']);
  sheet1Data.push(['']);

  MEAL_TYPES.forEach((mealType: MealType) => {
    const config = MEAL_TYPE_CONFIG[mealType];
    const mealFoods = foods.filter((f) => f.mealType === mealType);

    const mealCal = mealFoods.reduce((sum, f) => sum + (f.calories || 0), 0);
    const mealP = Math.round(mealFoods.reduce((sum, f) => sum + (f.protein || 0), 0) * 10) / 10;
    const mealC = Math.round(mealFoods.reduce((sum, f) => sum + (f.carbs || 0), 0) * 10) / 10;
    const mealF = Math.round(mealFoods.reduce((sum, f) => sum + (f.fat || 0), 0) * 10) / 10;

    // Header của từng bữa ăn
    sheet1Data.push([`>>> ${config.emoji} ${config.label.toUpperCase()} (${config.desc})`]);
    sheet1Data.push([
      'STT',
      'Tên món ăn',
      'Định lượng',
      'Đơn vị',
      'Năng lượng (kcal)',
      'Đạm (Protein - g)',
      'Tinh bột (Carbs - g)',
      'Chất béo (Fat - g)',
      'Ghi chú / Cách chế biến',
    ]);

    if (mealFoods.length === 0) {
      sheet1Data.push(['-', 'Chưa xếp món cho bữa này', '-', '-', 0, 0, 0, 0, '']);
    } else {
      mealFoods.forEach((food, idx) => {
        sheet1Data.push([
          idx + 1,
          food.foodName,
          food.quantity,
          food.unit || 'g',
          food.calories,
          food.protein,
          food.carbs,
          food.fat,
          food.note || '',
        ]);
      });
    }

    // Subtotal bữa
    sheet1Data.push([
      'TỔNG BỮA:',
      '',
      '',
      '',
      mealCal,
      mealP,
      mealC,
      mealF,
      `Tổng: ${mealCal} kcal | ${mealP}g P | ${mealC}g C | ${mealF}g F`,
    ]);
    sheet1Data.push(['']); // Dòng trống cách giữa các bữa
  });

  // TỔNG KẾT TOÀN DIỆN CẢ NGÀY
  sheet1Data.push(['========================================================================================']);
  sheet1Data.push([
    'TỔNG CỘNG THỰC NẠP CẢ NGÀY:',
    '',
    '',
    '',
    totalCal,
    totalP,
    totalC,
    totalF,
    `${foods.length} món ăn`,
  ]);
  sheet1Data.push([
    'MỤC TIÊU ĐỀ RA BAN ĐẦU:',
    '',
    '',
    '',
    target.calories,
    target.protein,
    target.carbs,
    target.fat,
    '',
  ]);

  const calPercent = target.calories > 0 ? Math.round((totalCal / target.calories) * 100) : 0;
  const pPercent = target.protein > 0 ? Math.round((totalP / target.protein) * 100) : 0;
  const cPercent = target.carbs > 0 ? Math.round((totalC / target.carbs) * 100) : 0;
  const fPercent = target.fat > 0 ? Math.round((totalF / target.fat) * 100) : 0;

  sheet1Data.push([
    'TỶ LỆ ĐẠT ĐƯỢC (%):',
    '',
    '',
    '',
    `${calPercent}%`,
    `${pPercent}%`,
    `${cPercent}%`,
    `${fPercent}%`,
    calPercent >= 90 && calPercent <= 110 ? 'ĐẠT CHUẨN MỤC TIÊU' : 'CẦN ĐIỀU CHỈNH',
  ]);

  // Tạo Worksheet 1
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);

  // Cấu hình độ rộng các cột cho Sheet 1
  ws1['!cols'] = [
    { wch: 8 },  // STT
    { wch: 32 }, // Tên món ăn
    { wch: 12 }, // Định lượng
    { wch: 10 }, // Đơn vị
    { wch: 18 }, // Năng lượng
    { wch: 18 }, // Đạm
    { wch: 20 }, // Tinh bột
    { wch: 18 }, // Chất béo
    { wch: 40 }, // Ghi chú
  ];

  // =========================================================================
  // SHEET 2: BẢNG TỔNG HỢP MACRO & ĐÁNH GIÁ
  // =========================================================================
  const sheet2Data: (string | number)[][] = [
    ['BẢNG SO SÁNH MACRO MỤC TIÊU VÀ THỰC NẠP THỰC TẾ'],
    ['Học viên:', effectiveClientName],
    ['Kế hoạch:', plan.name],
    [''],
    ['Chỉ số dinh dưỡng', 'Mục tiêu (Target)', 'Thực tế từ thực đơn', 'Chênh lệch (+/-)', '% Hoàn thành', 'Đánh giá'],
    [
      'Năng lượng (Calo)',
      `${target.calories} kcal`,
      `${totalCal} kcal`,
      `${totalCal - target.calories} kcal`,
      `${calPercent}%`,
      totalCal < target.calories * 0.9
        ? 'Thiếu hụt (Cần ăn thêm)'
        : totalCal > target.calories * 1.1
        ? 'Dư thừa (Cần giảm bớt)'
        : 'Hoàn hảo (Trong mức tối ưu)',
    ],
    [
      'Chất đạm (Protein)',
      `${target.protein} g`,
      `${totalP} g`,
      `${Math.round((totalP - target.protein) * 10) / 10} g`,
      `${pPercent}%`,
      totalP >= target.protein ? 'Đủ đạm phục hồi cơ' : 'Thiếu đạm (Bổ sung thịt/trứng/whey)',
    ],
    [
      'Tinh bột (Carbs)',
      `${target.carbs} g`,
      `${totalC} g`,
      `${Math.round((totalC - target.carbs) * 10) / 10} g`,
      `${cPercent}%`,
      totalC >= target.carbs ? 'Đủ năng lượng tập luyện' : 'Thiếu tinh bột',
    ],
    [
      'Chất béo (Fat)',
      `${target.fat} g`,
      `${totalF} g`,
      `${Math.round((totalF - target.fat) * 10) / 10} g`,
      `${fPercent}%`,
      totalF <= target.fat * 1.1 ? 'Kiểm soát tốt' : 'Hơi cao chất béo',
    ],
    [''],
    ['LƯU Ý CỦA HUẤN LUYỆN VIÊN (PT):'],
    ['- Học viên nên uống tối thiểu 2 - 2.5 lít nước mỗi ngày.'],
    ['- Các món ăn có thể linh hoạt thay thế bằng thực phẩm tương đương cùng nhóm chất.'],
    ['- Bữa ăn trước tập nên hoàn thành trước giờ tập 60 - 90 phút.'],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2['!cols'] = [
    { wch: 22 },
    { wch: 20 },
    { wch: 22 },
    { wch: 18 },
    { wch: 16 },
    { wch: 35 },
  ];

  // Tạo Workbook và gắn Sheets
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Thuc_Don_Chi_Tiet');
  XLSX.utils.book_append_sheet(wb, ws2, 'Tong_Hop_Macro');

  // Tạo tên file sạch sẽ, không dấu cách đặc biệt
  const safeName = effectiveClientName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const fileName = `Thuc_Don_${safeName}_${dateStr}.xlsx`;

  // Xuất file và tải về
  XLSX.writeFile(wb, fileName);
}

