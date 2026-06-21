import React, { useState, useEffect, useRef } from 'react';

const BASE_AMOUNT = 2970;
const BUMP_PRICES = { 'ob_f6d54dde6fe47621': 990, 'ob_2fc1ef1aa905453a': 990 };
const PROXY_URL = '/api/checkout_dotmax';
const CACHE_KEY_PREFIX = 'paradise_checkout_pix_52dc0200_';
const PIX_EXPIRATION_MINUTES = 5;

function formatCurrency(v) {
  return 'R$ ' + (v / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CheckoutDotadoMaximo({ onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bumps, setBumps] = useState({ 'ob_f6d54dde6fe47621': false, 'ob_2fc1ef1aa905453a': false });
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [showPix, setShowPix] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [paid, setPaid] = useState(false);
  const [expirationText, setExpirationText] = useState('--');
  const qrRef = useRef(null);
  const pollRef = useRef(null);

  const totalAmount = BASE_AMOUNT + Object.entries(bumps).reduce((acc, [k, v]) => acc + (v ? BUMP_PRICES[k] : 0), 0);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!document.getElementById('qrcodejs-script')) {
      const s = document.createElement('script');
      s.id = 'qrcodejs-script';
      s.src = 'https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js';
      document.body.appendChild(s);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (showPix && pixData?.pix?.pix_qr_code && qrRef.current && window.QRCode) {
      qrRef.current.innerHTML = '';
      new window.QRCode(qrRef.current, {
        text: pixData.pix.pix_qr_code,
        width: 184,
        height: 184,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M
      });
      const exp = new Date(Date.now() + PIX_EXPIRATION_MINUTES * 60 * 1000);
      setExpirationText(exp.toLocaleString('pt-BR').replace(',', ''));
      if (pixData.hash) startPolling(pixData.hash);
    }
  }, [showPix, pixData]);

  function startPolling(hash) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${PROXY_URL}?action=check_status&hash=${hash}&_=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.payment_status === 'paid') {
          clearInterval(pollRef.current);
          localStorage.removeItem(CACHE_KEY_PREFIX + totalAmount);
          setPaid(true);
        }
      } catch (e) { console.error(e); }
    }, 1500);
  }

  function toggleBump(hash) {
    setBumps(prev => ({ ...prev, [hash]: !prev[hash] }));
  }

  async function handlePay() {
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Preencha nome e e-mail para continuar.');
      return;
    }
    const cacheKey = CACHE_KEY_PREFIX + totalAmount;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { pixData: cachedPix, expiresAt } = JSON.parse(cached);
      if (new Date().getTime() < expiresAt) {
        setPixData(cachedPix);
        setShowPix(true);
        return;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }

    setLoading(true);
    const orderbump = Object.entries(bumps).filter(([k, v]) => v).map(([k]) => k);
    const utms = Object.fromEntries(new URLSearchParams(window.location.search));

    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name: name.trim(), email: email.trim() },
          orderbump,
          utms,
          checkoutUrl: window.location.href
        })
      });
      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch (e) { throw new Error('Servidor indisponível. Tente novamente.'); }
      if (!response.ok) throw new Error(result.message || result.error || 'Ocorreu um erro ao gerar o PIX.');

      if (result?.pix?.pix_qr_code) {
        const expiresAt = new Date().getTime() + PIX_EXPIRATION_MINUTES * 60 * 1000;
        localStorage.setItem(cacheKey, JSON.stringify({ pixData: result, expiresAt }));
      }
      setPixData(result);
      setShowPix(true);
    } catch (error) {
      setErrorMsg('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function copyPix() {
    if (!pixData?.pix?.pix_qr_code) return;
    navigator.clipboard.writeText(pixData.pix.pix_qr_code);
  }

  const bumpsList = [
    { hash: 'ob_f6d54dde6fe47621', title: 'Prazer Máximo', desc: 'Aprenda técnicas simples que fazem qualquer mulher gozar mais rápido.', img: 'https://i.imgur.com/hkrPpiZ.jpeg' },
    { hash: 'ob_2fc1ef1aa905453a', title: 'Fim da Ejaculação Precoce', desc: 'Exercícios fáceis para controlar o tempo e durar MUITO mais.', img: 'https://i.imgur.com/2P98g2Q.jpeg' }
  ];

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', fontFamily: '-apple-system, sans-serif', color: '#1f2937' }}>
      <header style={{ background: '#21bfeb', color: '#fff' }} className="w-full p-3 text-center text-sm font-semibold shadow-md">
        Compra Secura e Rápida
      </header>

      <main className="space-y-6 py-6">
        <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ borderRadius: 12 }} className="w-full bg-gray-200 overflow-hidden">
            <img src="https://i.imgur.com/pEtukLE.jpeg" alt="Banner" className="w-full object-cover" />
          </div>
        </div>

        <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '0 1rem' }}>
          <div className="shadow-lg p-5 bg-white" style={{ borderRadius: 12 }}>
            <p className="text-sm font-medium mb-4 opacity-80">Você está adquirindo:</p>
            <div className="flex items-center space-x-4">
              <img src="https://multi.paradisepags.com/uploads/product_images/store_6635_b2dc82c25282dcae8ca550ba3cbf0f24.png" alt="Dotado Máximo" className="w-16 h-16 object-cover flex-shrink-0 border border-gray-200 p-1" style={{ borderRadius: 8 }} />
              <div className="flex-grow">
                <h3 className="font-bold">Dotado Máximo</h3>
                <p className="text-lg font-semibold text-green-600">R$ 29,70</p>
              </div>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between items-center">
              <p className="font-bold text-lg">Total:</p>
              <p className="font-bold text-lg">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '0 1rem' }}>
          <div className="shadow-lg p-6 sm:p-8 bg-white" style={{ borderRadius: 12 }}>
            <div className="flex items-center mb-6">
              <span style={{ background: '#21bfeb' }} className="text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg mr-3 flex-shrink-0">1</span>
              <h2 className="text-xl font-bold">Identifique-se</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome e sobrenome</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome e sobrenome" className="w-full p-3 bg-gray-50 border border-gray-300 text-gray-900" style={{ borderRadius: 8 }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full p-3 bg-gray-50 border border-gray-300 text-gray-900" style={{ borderRadius: 8 }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '0 1rem' }}>
          <div className="shadow-lg p-6 sm:p-8 space-y-4 bg-white" style={{ borderRadius: 12 }}>
            {bumpsList.map(bump => (
              <label key={bump.hash} className="block p-4 border-2 border-dashed cursor-pointer" style={{ borderRadius: 12, borderColor: bumps[bump.hash] ? '#21bfeb' : '#d1d5db', background: bumps[bump.hash] ? '#eff6ff' : 'transparent' }}>
                <div className="flex items-start">
                  <input type="checkbox" checked={bumps[bump.hash]} onChange={() => toggleBump(bump.hash)} className="mt-1 mr-4" style={{ width: 20, height: 20 }} />
                  <div className="flex-grow flex items-center space-x-4">
                    <img src={bump.img} alt={bump.title} className="w-12 h-12 object-cover flex-shrink-0" style={{ borderRadius: 8 }} />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg">{bump.title}</h4>
                        <p className="font-semibold text-green-600 whitespace-nowrap">+ R$ 9,90</p>
                      </div>
                      <p className="text-sm opacity-80 mt-1">{bump.desc}</p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '0 1rem' }}>
          <div className="shadow-lg p-6 sm:p-8 bg-white" style={{ borderRadius: 12 }}>
            <div className="flex items-center mb-4">
              <span style={{ background: '#21bfeb' }} className="text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg mr-3 flex-shrink-0">2</span>
              <h2 className="text-xl font-bold">Pagamento</h2>
            </div>
            <button onClick={handlePay} disabled={loading} style={{ background: '#21bfeb', borderRadius: 10 }} className="w-full p-4 text-white font-bold text-lg uppercase hover:opacity-90 flex items-center justify-center disabled:opacity-60">
              {loading ? (
                <>
                  <span style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-block', marginRight: 8, animation: 'spin 1s linear infinite' }}></span>
                  Processando...
                </>
              ) : 'PAGAR AGORA'}
            </button>
            <div className="mt-4 text-center text-sm opacity-80">Pagamento seguro via <strong>PIX</strong> com aprovação imediata.</div>
          </div>
        </div>

        <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '0 1rem' }}>
          <div className="shadow-lg bg-white divide-y divide-gray-200" style={{ borderRadius: 12 }}>
            <div className="p-4 flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">🔒</div>
              <div><h4 class="font-bold">Dados protegidos</h4><p className="text-sm opacity-80">Os seus dados são confidenciais e seguros.</p></div>
            </div>
            <div className="p-4 flex items-center space-x-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">✅</div>
              <div><h4 class="font-bold">Pagamento 100% Seguro</h4><p className="text-sm opacity-80">As informações desta compra são criptografadas.</p></div>
            </div>
            <div className="p-4 flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">🎓</div>
              <div><h4 class="font-bold">Conteúdo Aprovado</h4><p className="text-sm opacity-80">100% revisado e aprovado por profissionais</p></div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '0 1rem' }}>
          <p className="text-center text-sm text-gray-500 mt-6">Compra 100% segura. Reembolso garantido em até 7 dias.</p>
        </div>

        {onBack && (
          <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '0 1rem' }}>
            <button onClick={onBack} className="text-sm text-gray-500 underline">← Voltar</button>
          </div>
        )}
      </main>

      {showPix && pixData && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, maxWidth: 380, width: '100%', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => { setShowPix(false); if (pollRef.current) clearInterval(pollRef.current); }} style={{ position: 'absolute', top: 10, right: 15, fontSize: 24, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            {paid ? (
              <>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Pagamento Aprovado! ✅</h2>
                <p style={{ marginTop: 8 }}>Obrigado pela sua compra.</p>
              </>
            ) : (
              <>
                <h2 style={{ margin: '0 0 16px', fontSize: 20, color: '#1f2937' }}>Pagamento via PIX</h2>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <div ref={qrRef} style={{ padding: 4, background: 'white', borderRadius: 4 }}></div>
                </div>
                <input type="text" readOnly value={pixData?.pix?.pix_qr_code || ''} style={{ width: '100%', boxSizing: 'border-box', padding: 12, fontSize: 13, marginBottom: 12, border: '1px solid #d1d5db', borderRadius: 8, color: '#374151', background: '#f9fafb', textAlign: 'center', fontFamily: 'monospace' }} />
                <button onClick={copyPix} style={{ background: '#00c27a', color: '#fff', border: 'none', width: '100%', padding: '14px 20px', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 16 }}>Copiar código PIX</button>
                <div style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.5 }}>
                  <p style={{ margin: '8px 0' }}>💰 Valor: <strong>{formatCurrency(totalAmount)}</strong></p>
                  <p style={{ margin: '8px 0' }}>🕒 Válido até: {expirationText}</p>
                  <p style={{ margin: '12px 0 0', color: '#00c27a', fontWeight: 'bold' }}>Pagamento seguro via PIX</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, maxWidth: 380, width: '100%', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setErrorMsg('')} style={{ position: 'absolute', top: 10, right: 15, fontSize: 24, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ margin: '0 0 12px', fontSize: 20, color: '#1f2937', fontWeight: 'bold' }}>Atenção</h2>
            <p style={{ margin: '0 0 24px', fontSize: 15, color: '#4b5563' }}>{errorMsg}</p>
            <button onClick={() => setErrorMsg('')} style={{ background: '#ef4444', color: '#fff', border: 'none', width: '100%', padding: 12, borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Voltar</button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
