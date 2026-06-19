import { useState, useEffect } from 'react';
import { Copy, Download, Trash2, Loader2, Calendar } from 'lucide-react';
import { ContentPlanItem } from '../types';

export default function ContentPlan() {
  const [niche] = useState('Онлайн-школа IT-стартапов');
  const [clarification, setClarification] = useState('AI');
  const [audiences, setAudiences] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [period, setPeriod] = useState('Неделя');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ContentPlanItem[]>(() => {
    const saved = localStorage.getItem('contentPlanResults');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('contentPlanResults', JSON.stringify(results));
  }, [results]);

  const clarificationOptions = ['AI', 'Fintech', 'Edtech'];

  const audienceOptions = [
    'предприниматели',
    'начинающие стартаперы',
    'продакт-менеджеры',
  ];

  const channelOptions = ['Email', 'Telegram', 'ВКонтакте'];
  const periodOptions = ['Сегодня', '3 дня', '5 дней', 'Неделя'];

  const toggleAudience = (aud: string) => {
    setAudiences(prev =>
      prev.includes(aud) ? prev.filter(a => a !== aud) : [...prev, aud]
    );
  };

  const toggleChannel = (ch: string) => {
    setChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const generatePlan = async () => {
    if (channels.length === 0) {
      alert('Выберите хотя бы один канал');
      return;
    }
    setIsGenerating(true);

    try {
      console.log('Requesting content plan generation from backend...');
      const response = await fetch('/api/gemini/content-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ niche, clarification, audiences, channels, period }),
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
      console.error('Error generating plan:', error);
      alert('Ошибка при генерации контент-плана');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyTopic = (topic: string) => {
    navigator.clipboard.writeText(topic);
  };

  const deleteItem = (id: string) => {
    setResults(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Center Panel - Parameters */}
      <div className="w-full md:w-1/2 min-h-[500px] md:min-h-0 p-4 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200 bg-white">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Параметры генерации</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ниша бизнеса</label>
            <input
              type="text"
              value={niche}
              disabled
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
            />
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Целевая аудитория</label>
            <div className="flex flex-col gap-1">
              {audienceOptions.map(aud => (
                <label key={aud} className="flex items-center space-x-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={audiences.includes(aud)}
                    onChange={() => toggleAudience(aud)}
                    className="w-3 h-3 text-gray-900 rounded border-gray-300 focus:ring-gray-900"
                  />
                  <span className="text-gray-700">{aud}</span>
                </label>
              ))}
            </div>
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Период</label>
            <div className="flex flex-wrap gap-1">
              {periodOptions.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all text-xs ${
                    period === p
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generatePlan}
            disabled={isGenerating}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            Сгенерировать контент-план
          </button>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="w-full md:w-1/2 min-h-[500px] md:min-h-0 p-8 overflow-y-auto bg-[#f5f5f5]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Результат</h2>
          {results.length > 0 && (
            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Скачать
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl bg-white">
            Заполните параметры и нажмите "Сгенерировать"
          </div>
        ) : (
          <div className="space-y-4">
            {results.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-lg border border-gray-200">
                      {item.date}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200">
                      {item.channel}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyTopic(item.topic)}
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Копировать тему"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-800 font-medium leading-relaxed">{item.topic}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
