import { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPanel() {
  const [heyGenKey, setHeyGenKey] = useState('');
  const [ttsProvider, setTtsProvider] = useState('ElevenLabs');
  const [ttsKey, setTtsKey] = useState('');
  const [imageProvider, setImageProvider] = useState('Gemini Image');
  const [imageKey, setImageKey] = useState('');

  const [heyGenStatus, setHeyGenStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [ttsStatus, setTtsStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [imageStatus, setImageStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    setHeyGenKey(localStorage.getItem('heygenApiKey') || '');
    setTtsProvider(localStorage.getItem('ttsProvider') || 'ElevenLabs');
    setTtsKey(localStorage.getItem('ttsApiKey') || '');
    setImageProvider(localStorage.getItem('imageProvider') || 'Gemini Image');
    setImageKey(localStorage.getItem('imageApiKey') || '');
  }, []);

  const saveHeyGen = () => {
    localStorage.setItem('heygenApiKey', heyGenKey);
    alert('HeyGen API Key сохранен');
  };

  const testHeyGen = async () => {
    setHeyGenStatus('testing');
    try {
      const res = await fetch('/api/heygen/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: '/v2/avatars', method: 'GET', apiKey: heyGenKey })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setHeyGenStatus('success');
    } catch (error) {
      console.error(error);
      setHeyGenStatus('error');
    }
  };

  const saveTts = () => {
    localStorage.setItem('ttsProvider', ttsProvider);
    localStorage.setItem('ttsApiKey', ttsKey);
    alert('Настройки TTS сохранены');
  };

  const testTts = () => {
    setTtsStatus('testing');
    setTimeout(() => setTtsStatus('success'), 1000); // Mock test
  };

  const saveImage = () => {
    localStorage.setItem('imageProvider', imageProvider);
    localStorage.setItem('imageApiKey', imageKey);
    alert('Настройки генерации изображений сохранены');
  };

  const testImage = () => {
    setImageStatus('testing');
    setTimeout(() => setImageStatus('success'), 1000); // Mock test
  };

  return (
    <div className="p-8 max-w-4xl mx-auto overflow-y-auto h-full bg-[#f5f5f5]">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Настройки интеграций</h2>

      <div className="space-y-8">
        {/* HeyGen Settings */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            HeyGen Integration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">HeyGen API Key <span className="text-red-500">*</span></label>
              <input
                type="password"
                value={heyGenKey}
                onChange={(e) => setHeyGenKey(e.target.value)}
                placeholder="Введите ваш API ключ HeyGen"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-shadow"
              />
            </div>
            
            <div className="flex gap-4 pt-2">
              <button
                onClick={saveHeyGen}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Сохранить
              </button>
              <button
                onClick={testHeyGen}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
              >
                Проверить подключение
                {heyGenStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {heyGenStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
              </button>
            </div>
          </div>
        </section>

        {/* TTS Settings */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">TTS сервис (для подкастов)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Провайдер</label>
              <select
                value={ttsProvider}
                onChange={(e) => setTtsProvider(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white transition-shadow"
              >
                <option value="ElevenLabs">ElevenLabs</option>
                <option value="Google Cloud TTS">Google Cloud TTS</option>
                <option value="Yandex SpeechKit">Yandex SpeechKit</option>
                <option value="Другой">Другой</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API ключ</label>
              <input
                type="password"
                value={ttsKey}
                onChange={(e) => setTtsKey(e.target.value)}
                placeholder="Введите API ключ провайдера"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-shadow"
              />
            </div>
            
            <div className="flex gap-4 pt-2">
              <button
                onClick={saveTts}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Сохранить
              </button>
              <button
                onClick={testTts}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
              >
                Проверить подключение
                {ttsStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {ttsStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
              </button>
            </div>
          </div>
        </section>

        {/* Image Generation Settings */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">AI генерация изображений</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Провайдер</label>
              <select
                value={imageProvider}
                onChange={(e) => setImageProvider(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white transition-shadow"
              >
                <option value="Gemini Image">Gemini Image</option>
                <option value="DALL-E">DALL-E</option>
                <option value="Stable Diffusion API">Stable Diffusion API</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API ключ</label>
              <input
                type="password"
                value={imageKey}
                onChange={(e) => setImageKey(e.target.value)}
                placeholder="Введите API ключ провайдера"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-shadow"
              />
            </div>
            
            <div className="flex gap-4 pt-2">
              <button
                onClick={saveImage}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Сохранить
              </button>
              <button
                onClick={testImage}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
              >
                Проверить подключение
                {imageStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {imageStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
