import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const aiService = {
  /**
   * Phân tích dữ liệu thống kê
   * @param {Object} data Dữ liệu doanh thu và sản phẩm
   * @param {string} type Loại thời gian (week, month, year)
   */
  analyzeStatistics: async (data, type) => {
    if (!API_KEY) {
      throw new Error("Vui lòng cấu hình VITE_GEMINI_API_KEY trong file .env");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Bạn là một chuyên gia phân tích dữ liệu kinh doanh cho cửa hàng "Tom Fruits Shop".
      Dưới đây là dữ liệu doanh thu (${type}) và danh sách sản phẩm bán chạy nhất:
      
      Dữ liệu doanh thu: ${JSON.stringify(data.revenue)}
      Sản phẩm bán chạy: ${JSON.stringify(data.bestSelling)}
      
      Nhiệm vụ:
      1. Đưa ra nhận xét tổng quan về tình hình kinh doanh.
      2. Chỉ ra xu hướng (tăng/giảm/ổn định) dựa trên dữ liệu doanh thu.
      3. Phân tích về các sản phẩm bán chạy (tại sao chúng bán chạy, gợi ý nhập thêm hàng gì).
      4. Đưa ra 2-3 lời khuyên hành động cụ thể để tăng doanh thu trong kỳ tới.
      
      Yêu cầu: Trả lời bằng tiếng Việt, ngắn gọn, súc tích, định dạng Markdown (sử dụng bullet points, bold).
      Không trả lời quá dài dòng.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Admin Error:", error);
      throw error;
    }
  }
};

export default aiService;
