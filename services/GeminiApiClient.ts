import axios from 'axios';

const API_KEY = 'AIzaSyADLXdLtdYq8BdT8GFMDAd2Llc1a7Ef1cw'; // Cảnh báo: KHÔNG AN TOÀN CHO ỨNG DỤNG SẢN XUẤT!
const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const MAX_CONVERSATION_PAIRS = 5;

interface ContentPart {
  text: string;
}

interface Content {
  role: 'user' | 'model';
  parts: ContentPart[];
}

interface GeminiApiRequestBody {
  contents: Content[];
}

interface GeminiApiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

class GeminiApiClient {
  private apiEndpoint: string;
  private chatHistory: Content[] = [];
  private initialInstructionGiven: boolean = false;

  constructor(endpoint: string = GEMINI_API_ENDPOINT) {
    this.apiEndpoint = endpoint;
  }

  private ensureInitialInstruction() {
    if (!this.initialInstructionGiven) {
      this.chatHistory = [
        {
          role: 'user',
          parts: [
            {
              text: 'Bạn là Măm Map Bot, một trợ lý ảo của nền tảng Măm Map. Măm Map là một hệ thống trung gian giúp các chủ quán ăn vặt đăng ký và quản lý thông tin quán của họ, đồng thời cho phép người dùng tìm kiếm, đánh giá và review các quán ăn vặt. Mọi câu trả lời của bạn phải liên quan đến cách sử dụng nền tảng Măm Map, lợi ích cho chủ quán, cách review, cách tìm quán, giải quyết vấn đề trên nền tảng. Nếu người dùng hỏi về quán ăn cụ thể hoặc món ăn ngon ở một khu vực, hãy hướng dẫn họ cách sử dụng tính năng tìm kiếm trên Măm Map để tìm quán phù hợp. Tuyệt đối không tư vấn về món ăn cụ thể của một quán hoặc gợi ý quán ăn ngoài nền tảng. Luôn giữ thái độ thân thiện, chuyên nghiệp và hữu ích.',
            },
          ],
        },
        {
          role: 'model',
          parts: [
            { text: 'Vâng, tôi đã hiểu rõ. Măm Map xin chào! Tôi là Măm Map Bot, sẵn sàng hỗ trợ bạn về cách sử dụng nền tảng review quán ăn vặt Măm Map. Bạn có câu hỏi nào cho tôi không?' },
          ],
        },
      ];
      this.initialInstructionGiven = true;
    }
  }

  private trimChatHistory() {
    if (this.chatHistory.length > 2 + MAX_CONVERSATION_PAIRS * 2) {
      const startIndex = this.chatHistory.length - (MAX_CONVERSATION_PAIRS * 2);
      this.chatHistory = [
        this.chatHistory[0],
        this.chatHistory[1],
        ...this.chatHistory.slice(startIndex),
      ];
    }
  }

  async generateContent(prompt: string, userName: string | null = null): Promise<string> {
    this.ensureInitialInstruction();

    const lowerCasePrompt = prompt.toLowerCase().trim();
    let finalBotResponseText: string;
    const greetingName = userName ? ` ${userName}` : ''; // Lấy tên người dùng

    // Kiểm tra các câu chào
    if (
      lowerCasePrompt === 'xin chào' ||
      lowerCasePrompt === 'chào' ||
      lowerCasePrompt === 'hi' ||
      lowerCasePrompt === 'hello' ||
      lowerCasePrompt === 'alo' ||
      lowerCasePrompt === 'ê'
    ) {
      finalBotResponseText = `Măm Map xin chào${greetingName}! Tôi là Măm Map Bot, bạn cần hỗ trợ gì về nền tảng review quán ăn vặt Măm Map ạ?`;
      this.chatHistory.push(
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: [{ text: finalBotResponseText }] },
      );
      return finalBotResponseText;
    }

    // Kiểm tra câu hỏi tìm quán ăn hoặc món ngon
    const findRestaurantKeywords = ['quán ăn', 'quán nào', 'ngon', 'khu vực', 'quận', 'gần đây', 'ở đâu'];
    const isFindRestaurantQuery = findRestaurantKeywords.some(keyword =>
      lowerCasePrompt.includes(keyword),
    );

    if (isFindRestaurantQuery) {
      finalBotResponseText =
        `Chào bạn${greetingName}, để tìm quán ăn vặt ngon, bạn có thể sử dụng tính năng tìm kiếm trên Măm Map! Hãy vào mục "Tìm quán" trên ứng dụng, nhập địa điểm (ví dụ: Quận 9) hoặc loại món ăn bạn thích, sau đó lọc theo đánh giá và review từ người dùng. Bạn muốn tôi hướng dẫn chi tiết cách dùng tính năng này không?`;
      this.chatHistory.push(
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: [{ text: finalBotResponseText }] },
      );
      return finalBotResponseText;
    }

    // Gửi các câu hỏi khác đến API và chèn tên vào phản hồi
    this.chatHistory.push({ role: 'user', parts: [{ text: prompt }] });
    this.trimChatHistory();

    const requestBody: GeminiApiRequestBody = {
      contents: this.chatHistory,
    };

    try {
      const response = await axios.post<GeminiApiResponse>(this.apiEndpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      const data = response.data;

      if (
        !data ||
        !data.candidates ||
        !Array.isArray(data.candidates) ||
        !data.candidates[0] ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts ||
        !Array.isArray(data.candidates[0].content.parts) ||
        !data.candidates[0].content.parts[0] ||
        !data.candidates[0].content.parts[0].text
      ) {
        throw new Error('Phản hồi từ Gemini API không đúng định dạng. Vui lòng thử lại.');
      }

      let botResponseFromApi = data.candidates[0].content.parts[0].text;

      // Kiểm tra xem câu trả lời từ API có chứa lời chào không
      const greetingPatterns = [
        /^chào bạn/i,
        /^chào anh/i,
        /^chào chị/i,
        /^xin chào/i,
        /^vâng,/i, // Đôi khi bot sẽ trả lời "Vâng, tôi đã hiểu..."
        /^tôi là/i, // Tránh trường hợp bot tự giới thiệu lại
      ];

      let startsWithGreeting = false;
      for (const pattern of greetingPatterns) {
        if (pattern.test(botResponseFromApi.trim())) {
          startsWithGreeting = true;
          break;
        }
      }

      // Chèn tên vào đầu câu trả lời nếu userName tồn tại và câu trả lời không quá ngắn
      if (userName && botResponseFromApi.length > 5) {
        if (startsWithGreeting) {
          // Nếu đã có lời chào từ bot, chỉ thêm tên nếu cần và chuẩn hóa
          // Ví dụ: "Chào bạn! Rất vui..." -> "Chào kacode357! Rất vui..."
          // Tìm vị trí của dấu chấm câu đầu tiên hoặc kết thúc lời chào để chèn tên
          const firstGreetingMatch = greetingPatterns.find(pattern => pattern.test(botResponseFromApi.trim()));
          if (firstGreetingMatch) {
            // Loại bỏ lời chào ban đầu nếu nó chỉ là "Chào bạn"
            let modifiedResponse = botResponseFromApi.trim();
            if (firstGreetingMatch.source.toLowerCase() === '^chào bạn') {
                modifiedResponse = modifiedResponse.replace(/^chào bạn\s*!?/i, '');
                // Chuyển ký tự đầu tiên thành chữ thường sau khi loại bỏ lời chào nếu nó là chữ hoa
                if (modifiedResponse.length > 0 && modifiedResponse[0] === modifiedResponse[0].toUpperCase() && modifiedResponse[0] !== modifiedResponse[0].toLowerCase()) {
                    modifiedResponse = modifiedResponse.charAt(0).toLowerCase() + modifiedResponse.slice(1);
                }
            }
            finalBotResponseText = `Chào bạn ${userName}, ${modifiedResponse.charAt(0).toLowerCase() + modifiedResponse.slice(1)}`;
          } else {
              // Trường hợp không xác định được pattern cụ thể, vẫn thêm tên vào đầu
              finalBotResponseText = `Chào bạn ${userName}, ${botResponseFromApi.charAt(0).toLowerCase() + botResponseFromApi.slice(1)}`;
          }
        } else {
          // Nếu bot chưa có lời chào, thêm "Chào bạn [Tên],"
          finalBotResponseText = `Chào bạn ${userName}, ${botResponseFromApi.charAt(0).toLowerCase() + botResponseFromApi.slice(1)}`;
        }
      } else {
        finalBotResponseText = botResponseFromApi;
      }

      console.log('Bot response with name:', finalBotResponseText);

      this.chatHistory.push({ role: 'model', parts: [{ text: finalBotResponseText }] });

      return finalBotResponseText;
    } catch (error: any) {
      if (this.chatHistory.length > 0 && this.chatHistory[this.chatHistory.length - 1].role === 'user') {
        this.chatHistory.pop();
      }

      console.error('Lỗi khi gọi Gemini API:', error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const statusCode = error.response.status;
          const errorMessage = error.response.data?.error?.message || 'Lỗi không xác định từ máy chủ.';

          if (statusCode === 429) {
            throw new Error(`Măm Map Bot đang quá tải, vui lòng thử lại sau ít phút nhé! (${errorMessage})`);
          } else if (statusCode >= 400 && statusCode < 500) {
            throw new Error(`Có vẻ như có vấn đề với yêu cầu của bạn, Măm Map Bot không hiểu. (${errorMessage})`);
          } else if (statusCode >= 500) {
            throw new Error(`Hệ thống Măm Map Bot đang gặp sự cố nội bộ. Vui lòng thử lại sau. (${errorMessage})`);
          } else {
            throw new Error(`Đã xảy ra lỗi không mong muốn từ máy chủ: ${errorMessage}`);
          }
        } else if (error.request) {
          throw new Error('Không thể kết nối đến Măm Map Bot. Vui lòng kiểm tra kết nối mạng của bạn.');
        } else {
          throw new Error(`Đã xảy ra lỗi khi chuẩn bị gửi tin nhắn: ${error.message}`);
        }
      } else {
        throw new Error(`Đã xảy ra lỗi không xác định: ${error.message || 'Vui lòng thử lại.'}`);
      }
    }
  }

  resetChatHistory() {
    this.chatHistory = [];
    this.initialInstructionGiven = false;
  }
}

export const geminiApiClient = new GeminiApiClient();