import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, ArrowRight, Flame, Factory, ShieldAlert, CheckCircle2, MapPin, Zap } from 'lucide-react';

interface AIAssistantViewProps {
  onNavigateToMapWithFilter?: (preset: string) => void;
  onSelectEvent?: (id: number) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  facilities?: { name: string; ratio: string; risk: string; eventId?: number }[];
  actionLabel?: string;
  actionPreset?: string;
  timestamp: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  onNavigateToMapWithFilter,
  onSelectEvent
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am FlameX AI Assistant. I monitor real-time satellite thermal detections, cross-reference environmental datasets (ESA WorldCover, OSM Facilities, WorldPop), and analyze historical baselines to detect abnormal industrial fires and gas flaring anomalies.\n\nHow can I assist your thermal investigation today?',
      timestamp: 'Just now'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const presets = [
    {
      query: 'Which industrial facilities have abnormal thermal activity today?',
      desc: 'Identifies facilities with >2x baseline intensity surges'
    },
    {
      query: 'Show industrial fires within 5 km of populated areas',
      desc: 'Cross-references WorldPop human exposure boundaries'
    },
    {
      query: 'List all persistent gas flaring sources',
      desc: 'Filters 30-day recurring combustion sources'
    },
    {
      query: 'What is the highest risk thermal anomaly currently active?',
      desc: 'Ranked by composite severity, FRP, and proximity'
    }
  ];

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse: Message;
      const lower = q.toLowerCase();

      if (lower.includes('abnormal') || lower.includes('facilities') || lower.includes('require attention')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: '🚨 3 industrial facilities require immediate attention due to abnormal thermal intensity surges beyond historical baselines:',
          facilities: [
            { name: 'XYZ Petrochemical Refinery Complex', ratio: '3.8× baseline (380 MW FRP)', risk: 'CRITICAL', eventId: 1 },
            { name: 'Southern Gas Processing Plant #04', ratio: '2.7× baseline (210 MW FRP)', risk: 'HIGH', eventId: 2 },
            { name: 'Coastal LNG Terminal & Flare Zone', ratio: '2.3× baseline (175 MW FRP)', risk: 'HIGH', eventId: 3 }
          ],
          actionLabel: 'Filter Abnormal Facilities on GIS Map',
          actionPreset: 'abnormal_fires',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else if (lower.includes('populat') || lower.includes('5 km') || lower.includes('area')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: '⚠️ Identified 2 industrial thermal events within 5 km of urban settlements (WorldPop population density > 1,200/km²):\n\n1. Event #FL-1042 (180m from XYZ Refinery, 2.1km from Residential District)\n2. Event #FL-1088 (Power Plant #04, 4.3km from Urban Boundary)',
          actionLabel: 'View High Population Risk Events on Map',
          actionPreset: 'abnormal_fires',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else if (lower.includes('flare') || lower.includes('persistent')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: '🟠 34 persistent thermal flaring sources identified across the monitored region. 31 are operating within normal baseline limits (26–30 detections in 30 days, average temp ~330K). 3 show elevated anomaly ratios.',
          actionLabel: 'View Persistent Sources Registry',
          actionPreset: 'persistent_flares',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `🔍 Processed investigation for: "${q}". The hybrid AI classifier analyzed geospatial features, land cover, and distance-to-infrastructure to segment active thermal events.`,
          actionLabel: 'Explore Live Command Center',
          actionPreset: 'all',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0B0F19] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0 bg-gray-950/60">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500" />
            FlameX AI Natural Language Assistant
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Ask natural language questions to query satellite detections, facility risk baselines, and historical anomalies.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold">
          <Bot className="w-4 h-4" />
          FlameX-LLM Engine Active
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl w-full mx-auto">
        {/* Preset Suggestions */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recommended Inquiries</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="text-left p-3 rounded-xl bg-gray-900/80 hover:bg-gray-800/90 border border-gray-800 hover:border-orange-500/40 transition group"
              >
                <div className="text-xs font-bold text-gray-200 group-hover:text-orange-400 flex items-center justify-between">
                  <span>"{p.query}"</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-orange-500" />
                </div>
                <div className="text-[11px] text-gray-500 mt-1">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20 mt-1">
                <Flame className="w-4 h-4 fill-white/20" />
              </div>
            )}

            <div className={`max-w-2xl rounded-2xl p-4 space-y-3 ${
              m.sender === 'user'
                ? 'bg-orange-600 text-white rounded-br-none shadow-xl'
                : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none shadow-2xl'
            }`}>
              <div className="text-xs leading-relaxed whitespace-pre-line font-medium">
                {m.text}
              </div>

              {/* Facility Callout Cards if AI response */}
              {m.facilities && m.facilities.length > 0 && (
                <div className="space-y-2 pt-2">
                  {m.facilities.map((f, fi) => (
                    <div
                      key={fi}
                      className="p-3 rounded-xl bg-black/40 border border-gray-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${f.risk === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                        <div>
                          <div className="font-bold text-white">{f.name}</div>
                          <div className="text-[11px] text-gray-400 font-mono">Thermal Surge: {f.ratio}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {f.risk}
                        </span>
                        {f.eventId && onSelectEvent && (
                          <button
                            onClick={() => onSelectEvent(f.eventId!)}
                            className="px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold transition"
                          >
                            Inspect
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Map Action Button */}
              {m.actionLabel && onNavigateToMapWithFilter && (
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToMapWithFilter(m.actionPreset || 'all')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 transition"
                  >
                    <span>{m.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className={`text-[10px] font-mono ${m.sender === 'user' ? 'text-orange-200 text-right' : 'text-gray-500'}`}>
                {m.timestamp}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 items-center text-gray-500 text-xs font-mono">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shrink-0">
              <Flame className="w-4 h-4 animate-spin" />
            </div>
            <span>FlameX AI is analyzing geospatial and thermal telemetry...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-800 bg-gray-950/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto flex items-center gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about active fires, industrial facilities, or flaring abnormalities..."
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-orange-500 transition placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="absolute right-2 top-2 p-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
