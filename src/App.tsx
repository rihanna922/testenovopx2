import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Lightbulb } from 'lucide-react';
import CheckoutDotadoMaximo from './CheckoutDotadoMaximo';

type StepBase = {
  progressText?: string;
  progressPercent?: number;
  subtitle?: string;
  title: string;
};

type QuestionStep = StepBase & {
  type: 'question';
  description: string;
  options: string[];
  infoBox?: string;
};

type InterstitialStep = StepBase & {
  type: 'interstitial';
  quote: string;
  buttonText: string;
};

type SliderStep = StepBase & {
  type: 'slider';
  description: string;
  buttonText: string;
};

type AnalysisStep = StepBase & {
  type: 'analysis';
  description: string;
};

type Step = QuestionStep | InterstitialStep | SliderStep | AnalysisStep;

const FUNNEL_STEPS: Step[] = [
  {
    type: 'question',
    progressText: 'Pergunta 1 de 8',
    progressPercent: 13,
    subtitle: 'PERGUNTA 1 DE 8',
    title: 'Quantos anos você tem?',
    description:
      'Isso determina sua janela de crescimento e a intensidade do protocolo',
    options: ['18 — 25', '26 — 35', '36 — 50', '51 — 65'],
  },
  {
    type: 'question',
    progressText: 'Pergunta 2 de 8',
    progressPercent: 25,
    subtitle: 'PERGUNTA 2 DE 8',
    title: 'Qual é o seu principal objetivo agora?',
    description: 'Vamos montar seu plano em torno disso',
    options: [
      'Aumentar o tamanho — comprimento e espessura',
      'Durar mais e melhorar a resistência',
      'Ereções mais fortes e firmes',
      'Todos os itens acima',
    ],
  },
  {
    type: 'question',
    progressText: 'Pergunta 3 de 8',
    progressPercent: 38,
    subtitle: 'PERGUNTA 3 DE 8',
    title: 'Com que frequência você acorda com ereção matinal?',
    description: 'Um indicador-chave da saúde da testosterona e do fluxo sanguíneo',
    options: [
      'Quase nunca',
      'Raramente — uma ou duas vezes por semana',
      'Na maioria das manhãs',
      'Toda manhã sem exceção',
    ],
    infoBox:
      'As ereções matinais são o indicador mais claro da produção de testosterona e da saúde arterial.',
  },
  {
    type: 'interstitial',
    progressText: 'Pergunta 3 de 8',
    progressPercent: 38,
    subtitle: 'VOCÊ SABIA?',
    title:
      'A fraqueza do assoalho pélvico pode ser a causa invisível por trás da ejaculação precoce',
    quote:
      'A tensão crônica ou fraqueza dos músculos pélvicos pode tornar a ejaculação automática e incontrolável.',
    buttonText: 'ENTENDI! →',
  },
  {
    type: 'question',
    progressText: 'Pergunta 4 de 8',
    progressPercent: 50,
    subtitle: 'PERGUNTA 4 DE 8',
    title: 'Qual é o seu comprimento ereto atual?',
    description: 'Seja honesto — seus resultados são completamente privados',
    options: ['Menos de 12 cm', '12 — 14 cm', '14 — 16 cm', 'Mais de 16 cm'],
  },
  {
    type: 'question',
    progressText: 'Pergunta 5 de 8',
    progressPercent: 63,
    subtitle: 'PERGUNTA 5 DE 8',
    title: 'Quantas horas de sono você costuma ter por noite?',
    description: 'O sono é quando a testosterona é produzida — isso importa mais do que você imagina',
    options: ['Menos de 5 horas', '5 – 6 horas', '6 – 7 horas', '8 horas ou mais'],
    infoBox: 'Até 70% da testosterona diária é produzida durante o sono profundo. Menos de 6 horas pode reduzir seu potencial de crescimento pela metade.',
  },
  {
    type: 'question',
    progressText: 'Pergunta 6 de 8',
    progressPercent: 75,
    subtitle: 'PERGUNTA 6 DE 8',
    title: 'Com que frequência você se exercita por semana?',
    description: 'A atividade física estimula diretamente a produção de hormônio do crescimento',
    options: ['Raramente ou nunca', 'Uma vez por semana', '2 – 3 vezes por semana', '4 ou mais vezes por semana'],
  },
  {
    type: 'interstitial',
    progressText: 'Pergunta 6 de 8',
    progressPercent: 75,
    subtitle: 'VOCÊ SABIA?',
    title: 'O controle ejaculatório está diretamente ligado à força dos músculos do assoalho pélvico',
    quote: 'Fortalecer esses músculos permite melhor controle do reflexo ejaculatório e maior retenção de sangue.',
    buttonText: 'ENTENDI! →',
  },
  {
    type: 'question',
    progressText: 'Pergunta 7 de 8',
    progressPercent: 88,
    subtitle: 'PERGUNTA 7 DE 8',
    title: 'Como você descreveria honestamente sua alimentação?',
    description: 'A nutrição alimenta a expansão tecidual em nível celular',
    options: ['Principalmente fast food e salgadinhos', 'Metade e metade — depende do dia', 'Refeições geralmente equilibradas', 'Alimentação limpa e natural na maior parte do tempo'],
  },
  {
    type: 'question',
    progressText: 'Pergunta 8 de 8',
    progressPercent: 100,
    subtitle: 'PERGUNTA 8 DE 8',
    title: 'Você já tentou algum método natural de aumento antes?',
    description: 'Isso determina por onde começamos o seu protocolo',
    options: ['Não — nunca ouvi falar', 'Já ouvi falar mas nunca tentei', 'Tentei, mas não fui consistente', 'Sim — mas vi poucos ou nenhum resultado'],
    infoBox: 'Bombas e pesos causam microlesões que bloqueiam o crescimento. Seu protocolo começa com uma fase de recuperação, se necessário.',
  },
  {
    type: 'slider',
    progressText: 'Finalizando',
    progressPercent: 100,
    subtitle: 'SEUS DADOS',
    title: 'Qual é a sua altura?',
    description: 'Usada para ajustar sua linha de base hormonal',
    buttonText: 'GERAR MEU PLANO PERSONALIZADO →',
  },
  {
    type: 'analysis',
    title: 'Analisando Seu Perfil',
    description: 'Criando seu protocolo personalizado...',
  },
];

const getBarState = (i: number, progress: number) => {
  const start = i * 20;
  const end = (i + 1) * 20;

  if (progress < start) return { status: 'Aguardando', statusColor: 'text-slate-400', fill: 0, fillColor: 'bg-transparent' };
  if (progress >= end) return { status: '✓ Concluído', statusColor: 'text-[#36C57C]', fill: 100, fillColor: 'bg-[#36C57C]' };
  
  const fill = ((progress - start) / 20) * 100;
  return { status: 'Processando...', statusColor: 'text-orange-500', fill, fillColor: 'bg-[#1A65E6]' };
};

const AnalysisView = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const carouselImages = [
    "https://fwomtoqsyvadmgzkmgto.supabase.co/storage/v1/object/public/arquivos%20novos/analise1.jpg.jpg",
    "https://fwomtoqsyvadmgzkmgto.supabase.co/storage/v1/object/public/arquivos%20novos/analise2.jpg.png",
    "https://fwomtoqsyvadmgzkmgto.supabase.co/storage/v1/object/public/arquivos%20novos/analise3.jpg.jpg",
    "https://fwomtoqsyvadmgzkmgto.supabase.co/storage/v1/object/public/arquivos%20novos/analise4.jpg.webp",
    "https://fwomtoqsyvadmgzkmgto.supabase.co/storage/v1/object/public/arquivos%20novos/05.webp"
  ];

  const carouselTexts = [
    "Paciente A.C -- +5,7cm - Verificado",
    "Paciente M.L -- +6,1cm - Verificado",
    "Paciente H.L -- +4,8cm - Verificado",
    "Paciente R.S -- +5,2cm - Verificado",
    "Paciente J.G -- +4,3cm - Verificado"
  ];

  useEffect(() => {
    const start = performance.now();
    const duration = 30000;

    const interval = setInterval(() => {
      const elapsed = performance.now() - start;
      const p = Math.min(100, Math.max(0, (elapsed / duration) * 100));
      setProgress(p);
      
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
           onComplete();
        }, 2000);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const imgInterval = setInterval(() => {
      setImageIndex(prev => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(imgInterval);
  }, [carouselImages.length]);

  const processes = [
    "Capacidade de Expansão Tecidual",
    "Potencial de Crescimento Natural",
    "Índice de Fluxo Vascular",
    "Linha de Base de Força Kegel",
    "Pontuação de Correspondência do Protocolo"
  ];

  return (
    <>
      {/* Rotating Images Carousel (moved to the top under title/description) */}
      <div className="w-full max-w-[220px] aspect-square mx-auto mb-4 rounded-xl overflow-hidden relative bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center shrink-0">
        {carouselImages.map((src, idx) => {
          const hasFailed = failedImages[idx];
          const isCurrent = idx === imageIndex;
          if (hasFailed) {
            return isCurrent ? (
              <div key={idx} className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-slate-50 text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Processando imagem de análise...</span>
              </div>
            ) : null;
          }
          return (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${isCurrent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <img 
                src={src}
                referrerPolicy="no-referrer"
                onError={() => setFailedImages(prev => ({ ...prev, [idx]: true }))}
                alt={`Analysis preview ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1.5 px-2 text-center">
                <p className="text-white font-sans text-[11px] font-semibold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                  {carouselTexts[idx]}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5 mb-2.5">
        {processes.map((proc, i) => {
          const state = getBarState(i, progress);
          return (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between items-center tracking-tight">
                <span className="font-['Roboto',_sans-serif] text-[14px] text-[#003466] font-medium">{proc}</span>
                <span className={`font-['Roboto',_sans-serif] text-[12px] font-bold transition-all duration-300 ${state.statusColor}`}>{state.status}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${state.fillColor} transition-all duration-100 ease-linear rounded-full`} style={{ width: `${state.fill}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center mt-3 shrink-0">
        <div className="font-['Montserrat',_sans-serif] text-[60px] font-extrabold text-[#003466] tabular-nums transition-all duration-300 leading-none">
          {Math.floor(progress)}%
        </div>
        <p className="text-slate-500 text-xs sm:text-sm font-medium uppercase tracking-widest mt-1">
          Análise em andamento
        </p>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-3 max-w-[200px] mx-auto">
          <div 
            className="h-full bg-gradient-to-r from-[#003466] to-[#20c997] rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  );
};

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [height, setHeight] = useState(175);
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  const [showFinalPage, setShowFinalPage] = useState(false);
  const [userData, setUserData] = useState({ age: '18 — 25', baseLength: 13 });

  const handleNext = () => {
    if (currentIndex < FUNNEL_STEPS.length - 1) {
      setCurrentIndex((curr) => curr + 1);
    }
  };

  const handleOptionClick = (option: string) => {
    if (currentIndex === 0) {
      setUserData(prev => ({ ...prev, age: option }));
    } else if (currentIndex === 4) {
      let length = 13;
      if (option === 'Menos de 12 cm') length = 11;
      if (option === '12 — 14 cm') length = 13;
      if (option === '14 — 16 cm') length = 15;
      if (option === 'Mais de 16 cm') length = 17;
      setUserData(prev => ({ ...prev, baseLength: length }));
    }
    handleNext();
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((curr) => curr - 1);
    }
  };

  const currentStep = FUNNEL_STEPS[currentIndex];

  if (showFinalPage) {
    return <FinalPage userData={userData} />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#003466] font-sans flex flex-col items-center overflow-x-hidden p-2 sm:p-4">
      {/* Header */}
      <header className="bg-[#003466] py-[20px] px-[16px] text-center w-full max-w-[480px] shrink-0">
        <p className="text-[#60A5FA] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-1">
          Consulta Profissional Gratuita
        </p>
        <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
          PROTOCOLO CONGOLÊS
        </h1>
        <p className="text-[#60A5FA] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
          Sistema Natural de Crescimento
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[480px] flex-1 flex flex-col min-h-0">
        {/* Progress Bar */}
        {currentStep.type !== 'analysis' && currentStep.type !== 'slider' && (
          <div className="bg-[#041A3A] rounded-xl p-2.5 w-full mb-3 border border-[#123564] shadow-lg shrink-0">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-300 mb-1.5 tracking-wide">
              <span>{currentStep.progressText}</span>
              <span>{currentStep.progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-[#123564] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0d3b8e] to-[#1A65E6] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${currentStep.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Dynamic Card */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-xl w-full p-4 flex flex-col"
            >
              {currentStep.type !== 'analysis' && (
                <>
                  {/* Card Subtitle */}
                  <h3 className="text-slate-400 text-[10px] sm:text-xs font-extrabold tracking-wider uppercase mb-2">
                    {currentStep.subtitle}
                  </h3>

                  {/* Card Title */}
                  <h2 className="font-['Montserrat',_sans-serif] text-[20px] sm:text-[22px] font-extrabold text-[#003466] leading-tight mb-1">
                    {currentStep.title}
                  </h2>
                </>
              )}

              {currentStep.type === 'analysis' && (
                <div className="text-center mb-3">
                  <h2 className="font-['Montserrat',_sans-serif] text-[20px] sm:text-[22px] font-extrabold text-[#003466] leading-tight mb-1">
                    {currentStep.title}
                  </h2>
                  <p className="font-['Roboto',_sans-serif] text-[14px] text-[#5E7D9F]">{currentStep.description}</p>
                </div>
              )}

              {/* Question Step Specifics */}
              {currentStep.type === 'question' && (
                <>
                  <p className="font-['Roboto',_sans-serif] text-[14px] text-[#5E7D9F] mb-[20px]">
                    {currentStep.description}
                  </p>

                  <div className="flex flex-col gap-2">
                    {currentStep.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 flex items-center justify-between hover:border-[#1A65E6] hover:bg-[#F8FAFC] transition-all text-left group shrink-0"
                      >
                        <span className="text-slate-600 font-medium text-[13px] sm:text-sm group-hover:text-[#0A2540]">
                          {option}
                        </span>
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-[#1A65E6] shrink-0 ml-4 transition-colors" />
                      </button>
                    ))}
                  </div>

                  {currentStep.infoBox && (
                    <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-start gap-2.5 shrink-0">
                      <div className="shrink-0 mt-0.5">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {currentStep.infoBox}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Interstitial Step Specifics */}
              {currentStep.type === 'interstitial' && (
                <>
                  {currentStep.title === 'A fraqueza do assoalho pélvico pode ser a causa invisível por trás da ejaculação precoce' ? (
                     <div className="w-full mb-3 flex items-center justify-center overflow-hidden shrink-0 bg-transparent">
                       <video 
                         src="/Assoalho-Pelvico-1.mp4" 
                         autoPlay 
                         loop 
                         muted 
                         playsInline
                         className="w-full h-auto object-cover rounded-xl"
                       />
                     </div>
                  ) : currentStep.title === 'O controle ejaculatório está diretamente ligado à força dos músculos do assoalho pélvico' ? (
                     <div className="w-full mb-3 flex items-center justify-center overflow-hidden shrink-0 bg-transparent">
                       <video 
                         src="/Assoalho-Pelvico-2.mp4" 
                         autoPlay 
                         loop 
                         muted 
                         playsInline
                         className="w-full h-auto object-cover rounded-xl"
                       />
                     </div>
                  ) : (
                    <div className="w-full aspect-[2.5/1] bg-slate-100 rounded-xl mb-3 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                      <div className="text-slate-400 text-sm font-medium"></div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                    <p className="italic text-slate-600 leading-relaxed text-sm font-medium">
                      "{currentStep.quote}"
                    </p>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full bg-[#004198] text-white font-['Montserrat',_sans-serif] text-[15px] font-semibold rounded-xl py-[16px] px-0 hover:bg-blue-800 transition-colors shadow-md shadow-blue-500/20 mt-auto"
                  >
                    {currentStep.buttonText}
                  </button>
                </>
              )}

              {/* Analysis Step Specifics */}
              {currentStep.type === 'analysis' && (
                <AnalysisView onComplete={() => setShowFinalPage(true)} />
              )}

              {/* Slider Step Specifics */}
              {currentStep.type === 'slider' && (
                <div className="flex flex-col items-center w-full">
                  <p className="font-['Roboto',_sans-serif] text-[14px] text-[#5E7D9F] mb-[20px] w-full">
                    {currentStep.description}
                  </p>

                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-1 flex items-center mb-4 self-center shrink-0">
                    <button className={`py-1.5 px-6 rounded-md text-sm font-bold transition-colors ${unit === 'cm' ? 'bg-[#003466] text-white shadow' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setUnit('cm')}>cm</button>
                    <button className={`py-1.5 px-6 rounded-md text-sm font-bold transition-colors ${unit === 'in' ? 'bg-[#003466] text-white shadow' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setUnit('in')}>pés / pol</button>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 w-full text-center border border-slate-100 mb-5 shrink-0">
                    <h1 className="font-['Montserrat',_sans-serif] text-[60px] font-extrabold text-[#003466] tabular-nums mb-1 leading-none">
                      {unit === 'in' ? `${Math.floor(height / 30.48)}'${Math.round((height / 2.54) % 12)}"` : height}
                    </h1>
                    <p className="text-slate-400 font-medium text-xs mb-6 uppercase tracking-wider">
                      {unit === 'cm' ? 'centímetros' : 'pés / pol'}
                    </p>

                    <div className="px-2">
                      <input
                        type="range"
                        min="140"
                        max="225"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#003466]"
                        style={{
                          background: `linear-gradient(to right, #003466 ${((height - 140) / (225 - 140)) * 100}%, #e2e8f0 ${((height - 140) / (225 - 140)) * 100}%)`
                        }}
                      />
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-3 font-medium">
                        <span>140 cm</span>
                        <span>225 cm</span>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={handleNext} className="w-full bg-[#004198] text-white font-['Montserrat',_sans-serif] text-[15px] font-semibold tracking-wide rounded-xl py-[16px] px-0 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 mt-auto">
                    {currentStep.buttonText}
                  </button>
                </div>
              )}

              {/* Back Button */}
              {currentIndex > 0 && currentStep.type !== 'analysis' && (
                <button
                  onClick={handleBack}
                  className="mt-3 text-slate-400 hover:text-slate-600 font-medium text-[12px] sm:text-[13px] flex items-center transition-colors -ml-1 px-1 py-1"
                >
                  ← {currentStep.type === 'interstitial' ? 'Anterior' : 'Pergunta anterior'}
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[480px] mt-3 sm:mt-4 shrink-0">
        <div className="bg-[#041A3A] rounded-xl p-2.5 flex items-start sm:items-center gap-2 border border-[#123564]">
          <Lock className="w-3.5 h-3.5 text-[#60A5FA] shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-[11px] text-[#93C5FD] font-medium leading-snug">
            Suas respostas são 100% privadas — nunca compartilhadas ou vendidas
          </p>
        </div>
      </footer>
    </div>
  );
}

const FinalPage = ({ userData }: { userData: { age: string, baseLength: number } }) => {
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 48);
  const [showCheckout, setShowCheckout] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const timerString = `${minutes}:${seconds}`;

  if (showCheckout) {
    return <CheckoutDotadoMaximo onBack={() => setShowCheckout(false)} />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#F4F7F9] font-sans flex flex-col items-center overflow-x-hidden pb-12 w-full">
      {/* Top Banner */}
      <div className="w-full bg-[#36C57C] text-white text-center py-2 font-bold text-sm">
        Seu plano personalizado está pronto — 3 vagas restantes hoje
      </div>

      {/* Header */}
      <header className="bg-[#003466] py-[20px] px-[16px] text-center w-full">
        <p className="text-[#60A5FA] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-1">
          Consulta Profissional Gratuita
        </p>
        <h1 className="text-white text-2xl sm:text-3xl font-black tracking-tight mb-1 font-['Montserrat',_sans-serif]">
          PROTOCOLO CONGOLÊS
        </h1>
        <p className="text-[#60A5FA] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
          Sistema Natural de Crescimento
        </p>
      </header>

      <div className="w-full max-w-md flex flex-col">
          {/* Timer Box */}
          <div className="bg-[#FFF9EB] border border-[#FDE08B] rounded-xl flex justify-between items-center p-4 mx-4 mt-4 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[#D97706] text-[10px] font-bold uppercase tracking-wider">Reservado para você</span>
              <span className="text-[#78350F] text-sm font-medium">Seu plano expira em</span>
            </div>
            <div className="text-[#9A3412] font-['Montserrat',_sans-serif] text-3xl font-extrabold tabular-nums">
              {timerString}
            </div>
          </div>

          {/* Main Card */}
          <div className="mx-4 mt-6 rounded-xl shadow-md overflow-hidden">
             {/* Card Top */}
             <div className="bg-[#003466] p-5 text-center">
                <p className="text-[#60A5FA] text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2">Seu Plano Personalizado</p>
                <h2 className="font-['Montserrat',_sans-serif] text-white text-3xl font-extrabold leading-tight mb-2">Protocolo Crescimento Rápido</h2>
                <p className="text-[#93C5FD] text-xs sm:text-sm">Protocolo Congolês + Treino Kegel · Calibrado para <span className="font-bold whitespace-nowrap" id="dyn-age">{userData.age}</span></p>
             </div>
             {/* Card Body */}
             <div className="bg-[#EEF2FF] p-6 flex flex-col items-center">
                <p className="text-[#5E7D9F] text-sm font-medium mb-1">Seu ganho projetado em 45 dias</p>
                <div className="font-['Montserrat',_sans-serif] text-[72px] font-extrabold text-[#003466] leading-none mb-2 tracking-tighter">
                  +5cm
                </div>
                <p className="text-center text-[#5E7D9F] text-xs px-4 mb-6">Baseado na sua idade, perfil de saúde e linha de base hormonal</p>

                {/* Timeline Bar */}
                <div className="w-full mb-6">
                  <div className="flex justify-between text-[10px] font-bold text-[#5E7D9F] uppercase mb-1">
                    <span>Agora</span>
                    <span>Dia 45</span>
                  </div>
                  <div className="bg-[#004198] rounded-full py-2 flex justify-center items-center shadow-inner">
                    <span className="text-white font-bold text-sm tracking-wide">
                      <span id="dyn-start">{userData.baseLength}</span>cm → <span id="dyn-end">{userData.baseLength + 5}</span>cm
                    </span>
                  </div>
                </div>

                {/* 3 Mini-Cards */}
                <div className="grid grid-cols-3 gap-2 w-full">
                   <div className="bg-white border border-slate-200 rounded-lg p-2 flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Semana 2</span>
                      <span className="text-[#004198] font-black text-lg leading-none mb-1">+1.4cm</span>
                      <span className="text-[9px] text-slate-500 leading-tight">Primeiras mudanças</span>
                   </div>
                   <div className="bg-white border border-slate-200 rounded-lg p-2 flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dia 21</span>
                      <span className="text-[#004198] font-black text-lg leading-none mb-1">+2.9cm</span>
                      <span className="text-[9px] text-slate-500 leading-tight">Crescimento visível</span>
                   </div>
                   <div className="bg-white border border-slate-200 rounded-lg p-2 flex flex-col items-center justify-center text-center shadow-sm w-full">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dia 45</span>
                      <span className="text-[#004198] font-black text-lg leading-none mb-1">+5cm</span>
                      <span className="text-[9px] text-slate-500 leading-tight">Resultado completo</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-xl shadow-sm p-5 mx-4 mt-4 border border-slate-100">
             <ul className="space-y-3">
                {[
                  "Aumente comprimento e espessura naturalmente — sem aparelhos",
                  "Ereções mais fortes e duradouras",
                  "Técnicas avançadas de Kegel para resistência e controle",
                  "Primeiros resultados visíveis em 14 dias",
                  "Mais confiança e desempenho na cama",
                  "Sem pílulas, sem bombas, sem efeitos colaterais",
                  "Discreto — tudo feito em casa"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-[#E6F8F0] border border-[#36C57C]/30 text-[#36C57C]">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[#5E7D9F] text-sm leading-snug">{item}</span>
                  </li>
                ))}
             </ul>
          </div>

          {/* Testimonials */}
          <div className="mt-10 mx-4">
             <h3 className="text-center text-[#5E7D9F] text-xs font-bold tracking-[0.15em] uppercase mb-6">
                Resultados Reais de Homens no Brasil
             </h3>
             <div className="space-y-4">
                {/* Testimonial 1 */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                   <div className="flex items-start gap-3 mb-3">
                     <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0 overflow-hidden">
                       <img src="https://i.imgur.com/NLHchf3.png" alt="Avatar" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-[#003466] text-sm">Carlos M., 34</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {/* 5 Stars */}
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, j) => (
                                  <svg key={j} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                              </div>
                              <span className="text-slate-400 text-xs ml-1">São Paulo</span>
                            </div>
                          </div>
                          <div className="bg-[#E6F8F0] text-[#065F46] border border-[#36C57C]/40 text-[10px] font-bold px-2 py-1 rounded">
                             +3,7cm verificado
                          </div>
                        </div>
                     </div>
                   </div>
                   <p className="text-[#5E7D9F] text-sm leading-relaxed">
                     "Te parabenizo pelo que você está oferecendo. Minha insegurança me mantinha fechado. Só saía para ganhar dinheiro, que depois gastava com coisas que não funcionavam — pílulas, bombas e pesos. Colocar seu método em prática foi como voltar à vida. Você explica tudo de forma tão simples e clara..."
                   </p>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                   <div className="flex items-start gap-3 mb-3">
                     <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0 overflow-hidden">
                       <img src="https://i.imgur.com/g9Apzpn.png" alt="Avatar" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-[#003466] text-sm">Roberto K., 38</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {/* 5 Stars */}
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, j) => (
                                  <svg key={j} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                              </div>
                              <span className="text-slate-400 text-xs ml-1">Rio de Janeiro</span>
                            </div>
                          </div>
                          <div className="bg-[#E6F8F0] text-[#065F46] border border-[#36C57C]/40 text-[10px] font-bold px-2 py-1 rounded">
                             +3,7cm verificado
                          </div>
                        </div>
                     </div>
                   </div>
                   <p className="text-[#5E7D9F] text-sm leading-relaxed">
                     "Sou muito grato a você. Mas minha esposa é ainda mais grata! Você salvou meu casamento. A mudança foi incrível, muito perceptível e mais rápida do que eu imaginava. De 15 para 18,7 centímetros, e a espessura de 11 para 12,8 centímetros. Minha esposa está na melhor fase da vida dela. E graças a você, é comigo! Você me libertou de um problema enorme. Valeu demais!"
                   </p>
                </div>

                {/* Testimonial 3 */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                   <div className="flex items-start gap-3 mb-3">
                     <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0 overflow-hidden">
                       <img src="https://i.imgur.com/nxIJHWY.png" alt="Avatar" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-[#003466] text-sm">Jorge F., 42</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {/* 5 Stars */}
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, j) => (
                                  <svg key={j} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                              </div>
                              <span className="text-slate-400 text-xs ml-1">Belo Horizonte</span>
                            </div>
                          </div>
                          <div className="bg-[#E6F8F0] text-[#065F46] border border-[#36C57C]/40 text-[10px] font-bold px-2 py-1 rounded">
                             +4,2cm verificado
                          </div>
                        </div>
                     </div>
                   </div>
                   <p className="text-[#5E7D9F] text-sm leading-relaxed">
                     "Foram meses difíceis. Minha esposa Paula me deixou após 7 anos de casamento. Não a culpo — ficamos mais de um ano sem uma relação íntima de verdade... Ficar solteiro de novo com zero confiança estava me levando à depressão. Tentei muita coisa, mas só tive dor e dinheiro perdido. Um amigo me indicou seu sistema e eu duvidei, mas sem nada a perder segui suas instruções... Agora não só sou maior, mas mais firme e durando mais. Em 2 meses fui com 5 mulheres novas, e cada uma teve experiências incríveis! Aparentemente minha ex ficou sabendo e agora quer voltar..."
                   </p>
                </div>
             </div>
          </div>

          {/* Guarantee Box */}
          <div className="bg-[#003466] text-white p-5 rounded-xl mx-4 mt-8 flex items-start sm:items-center gap-4 shadow-lg shadow-[#003466]/20">
            <svg className="w-10 h-10 text-[#60A5FA] shrink-0 fill-current opacity-80" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 8.97-7 10.02-3.87-1.05-7-5.35-7-10.02v-4.7l7-3.12z"/></svg>
            <div>
               <h4 className="font-bold font-['Montserrat',_sans-serif] text-[15px] sm:text-base leading-snug mb-1">Garantia de 30 Dias com Devolução do Dinheiro</h4>
               <p className="text-[#93C5FD] text-xs leading-relaxed">Sem resultados em 30 dias? Reembolso total. Sem perguntas.</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="px-4 mt-5">
             <button 
               onClick={() => {
                 setShowCheckout(true);
               }}
               className="w-full bg-[#36C57C] text-white font-['Montserrat',_sans-serif] font-extrabold text-[16px] py-4 rounded-xl shadow-lg shadow-[#36C57C]/40 hover:bg-[#2ead69] transition-transform active:scale-[0.98]"
             >
               QUERO MEU PLANO AGORA →
             </button>
             
             {/* Footer Security Texts */}
             <div className="mt-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span>Pagamento seguro · Cobrança discreta</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Entrega para todo o Brasil · Preços em BRL
                </div>
             </div>
          </div>

          {/* Final Urgency Box */}
          <div className="bg-[#FFF9EB] border border-[#FDE08B] text-[#9A3412] p-3 mx-4 rounded-xl mt-5 mb-10 flex items-center justify-center gap-2 shadow-sm font-medium">
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
             <span className="text-sm font-bold">2 vagas restantes neste preço — expira em {timerString}</span>
          </div>

      </div>
    </div>
  );
};
