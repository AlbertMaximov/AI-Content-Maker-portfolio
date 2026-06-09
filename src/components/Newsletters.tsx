import { useState, useEffect } from 'react';
import { Copy, Download, Trash2, Loader2, Mail, Image as ImageIcon } from 'lucide-react';
import { NewsletterItem } from '../types';
import ReactMarkdown from 'react-markdown';

export default function Newsletters() {
  const [topic, setTopic] = useState('');
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [clarification, setClarification] = useState('AI');
  const [channels, setChannels] = useState<string[]>([]);
  const [contentType, setContentType] = useState('образовательный');
  const [tone, setTone] = useState('Дружелюбный');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<NewsletterItem[]>(() => {
    const saved = localStorage.getItem('newsletterResults');
    return saved ? JSON.parse(saved) : [];
  });

  const contentPlanResults = JSON.parse(localStorage.getItem('contentPlanResults') || '[]');
  const topicOptions = contentPlanResults.map((item: any) => item.topic);

  useEffect(() => {
    localStorage.setItem('newsletterResults', JSON.stringify(results));
  }, [results]);

  const clarificationOptions = ['AI', 'Fintech', 'Edtech'];

  const channelOptions = ['Email', 'Telegram', 'ВКонтакте'];
  const contentTypeOptions = ['образовательный', 'продающий', 'кейс стартапа', 'приглашение на вебинар', 'разбор ошибки'];
  const toneOptions = ['Дружелюбный', 'Экспертный', 'Мотивирующий', 'Стартап-энтузиазм'];

  const toggleChannel = (ch: string) => {
    setChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const generateNewsletter = async () => {
    if (!topic) {
      alert('Введите тему');
      return;
    }
    if (channels.length === 0) {
      alert('Выберите хотя бы один канал');
      return;
    }
    setIsGenerating(true);

    try {
      console.log('Requesting newsletter text from backend...');
      const response = await fetch('/api/gemini/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, clarification, channels, contentType, tone }),
      });

      if (!response.ok) {
        throw new Error('Backend request failed');
      }

      const data = await response.json();
      const text = data.text || '[]';
      console.log('Parsed text from backend:', text);
      const parsed = JSON.parse(text);
      
      const newResults = parsed.map((item: any) => ({
        id: Math.random().toString(36).substring(7),
        ...item
      }));

      setResults(newResults);
    } catch (error) {
      console.error('Error generating newsletter:', error);
      alert('Ошибка при генерации рассылки');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async (id: string, channel: string) => {
    try {
      const item = results.find(r => r.id === id);
      if (!item) return;

      console.log('Requesting visual asset generation from backend...');
      const reqResponse = await fetch('/api/gemini/newsletter-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, channel, text: item.text }),
      });

      if (!reqResponse.ok) {
        throw new Error('Backend generation failed');
      }

      const data = await reqResponse.json();
      if (data.base64Data) {
        const imageUrl = `data:image/png;base64,${data.base64Data}`;
        setResults(prev => prev.map(r => r.id === id ? { ...r, imageUrl } : r));
      } else {
        alert('Не удалось сгенерировать изображение');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Ошибка при генерации изображения');
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = (text: string, channel: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `post_${channel}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const deleteItem = (id: string) => {
    setResults(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="flex h-full">
      {/* Center Panel */}
      <div className="w-1/2 p-4 overflow-y-auto border-r border-gray-200 bg-white">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Параметры рассылки</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Тема</label>
            <div className="space-y-2">
              <select
                value={isCustomTopic ? 'custom' : topic}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomTopic(true);
                    setTopic('');
                  } else {
                    setIsCustomTopic(false);
                    setTopic(e.target.value);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white text-sm transition-shadow"
              >
                <option value="">Выберите тему из контент-плана</option>
                {topicOptions.map((t: string, i: number) => (
                  <option key={i} value={t}>{t}</option>
                ))}
                <option value="custom">Предложить свою тему</option>
              </select>
              {isCustomTopic && (
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Введите свою тему"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm transition-shadow"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Уточнение</label>
            <select
              value={clarification}
              onChange={(e) => setClarification(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white text-sm transition-shadow"
            >
              {clarificationOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Каналы</label>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map(ch => (
                <label key={ch} className="flex items-center space-x-1 cursor-pointer bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-xs">
                  <input
                    type="checkbox"
                    checked={channels.includes(ch)}
                    onChange={() => toggleChannel(ch)}
                    className="w-3 h-3 text-gray-900 rounded border-gray-300 focus:ring-gray-900"
                  />
                  <span className="text-gray-700 font-medium">{ch}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Тип контента</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white text-sm transition-shadow"
            >
              {contentTypeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Тон</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white text-sm transition-shadow"
            >
              {toneOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <button
            onClick={generateNewsletter}
            disabled={isGenerating}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Сгенерировать текст
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 p-8 overflow-y-auto bg-[#f5f5f5]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Результат</h2>
        </div>

        {results.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl bg-white">
            Заполните параметры и нажмите "Сгенерировать"
          </div>
        ) : (
          <div className="space-y-6">
            {results.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                  <span className="px-4 py-1.5 bg-gray-100 text-gray-800 text-sm font-semibold rounded-xl border border-gray-200">
                    {item.channel}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateImage(item.id, item.channel)}
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                      title="Сгенерировать изображение"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Картинка
                    </button>
                    <button
                      onClick={() => copyText(item.text)}
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Копировать"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadText(item.text, item.channel)}
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Скачать .txt"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {item.imageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
                    <img src={item.imageUrl} alt="Generated" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-gray-800">
                  <div className="markdown-body">
                    <ReactMarkdown>{item.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
