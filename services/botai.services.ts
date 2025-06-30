import { skipNotiAxiosInstance } from '@/config/axios.customize';

const askGemini = async (data: { prompt: string }) => {
    const response = await skipNotiAxiosInstance.post('/api/Gemini/ask', data);
    return response.data;
};

export { askGemini };

