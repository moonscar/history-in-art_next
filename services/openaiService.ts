// @ts-nocheck
interface ChatResponse {
  location?: {
    country: string;
    city: string 
  };
  timeRange?: {
    start: number;
    end: number;
  };
  message: string;
}

interface APIResponse {
  start_time: string | "";
  end_time: string | "";
  country: string | "";
  city: string | "";
}

export class OpenAIService {
  static async processUserQuery(userMessage: string): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/openaiProxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: userMessage }]
        }),
      });

      if (!response.ok) {
        throw new Error('API 调用失败');
      }

      const apiResponse: APIResponse = await response.json();

      // 先创建基本的 result 对象
      const result: ChatResponse = { message: '' };

      // 先处理数据赋值
      if (apiResponse.country) {
        result.location = {
          country: apiResponse.country,
          city: apiResponse.city
        };
      }

      const startYear = this.parseTimeToYear(apiResponse.start_time);
      const endYear = this.parseTimeToYear(apiResponse.end_time);

      if (startYear !== null || endYear !== null) {
        result.timeRange = {
          start: startYear || 0,
          end: endYear || new Date().getFullYear()
        };
      }

      // 然后根据已赋值的数据构建消息
      const extractedInfo = [];

      if (result.location) {
        const locationInfo = result.location.city && result.location.city.trim()
          ? `\n地点：${result.location.country}, ${result.location.city}`
          : `\n地点：${result.location.country}`;
          extractedInfo.push(locationInfo);
      }

      if (result.timeRange) {
        const timeInfo = result.timeRange.start === result.timeRange.end 
          ? `${result.timeRange.start}年` 
          : `${result.timeRange.start}-${result.timeRange.end}年`;
        extractedInfo.push(`\n时间：${timeInfo}\n`);
      }

      console.log(apiResponse);

      if (extractedInfo.length > 0) {
        result.message = `已从您的输入中提取 ${extractedInfo.join('，')} 即将为您跳转到指定的时间地点查找相关艺术品数据...`;
      } else {
        result.message = '未能从输入中提取到明确的时间和地点信息，请尝试更具体的描述。';
      }

      return result;
    } catch (error) {
      console.error('Error calling API:', error);
      return this.fallbackProcessing(userMessage);
    }
  }
  private static parseTimeToYear(timeStr: string | null): number | null {
    if (!timeStr) return null;

    const yearMatch = timeStr.match(/(\d{1,4})年?/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      if (year < 100 && year > 0) {
        return year < 50 ? 2000 + year : 1900 + year;
      }
      return year;
    }

    if (timeStr.includes('今天') || timeStr.includes('现在')) {
      return new Date().getFullYear();
    }

    return null;
  }

  private static fallbackProcessing(query: string): ChatResponse {
    const queryLower = query.toLowerCase();
    let response: ChatResponse = {
      message: '抱歉，我无法连接到AI服务。使用本地处理为您查找相关内容。',
      location: {country: '', city: ''}
    };

    // 时间范围处理
    if (queryLower.includes('文艺复兴') || queryLower.includes('renaissance')) {
      response.timeRange = { start: 1400, end: 1600 };
      response.message += ' 已设置时间范围为文艺复兴时期。';
    } else if (queryLower.includes('巴洛克') || queryLower.includes('baroque')) {
      response.timeRange = { start: 1600, end: 1750 };
      response.message += ' 已设置时间范围为巴洛克时期。';
    } else if (queryLower.includes('现代') || queryLower.includes('modern')) {
      response.timeRange = { start: 1900, end: 1980 };
      response.message += ' 已设置时间范围为现代艺术时期。';
    }

    // 地点处理
    if (queryLower.includes('意大利') || queryLower.includes('italy')) {
      response.location.country = 'Italy';
      response.message += ' 已筛选意大利地区的艺术品。';
    } else if (queryLower.includes('法国') || queryLower.includes('france')) {
      response.location.country = 'France';
      response.message += ' 已筛选法国地区的艺术品。';
    } else if (queryLower.includes('日本') || queryLower.includes('japan')) {
      response.location.country = 'Japan';
      response.message += ' 已筛选日本地区的艺术品。';
    }

    return response;
  }
}