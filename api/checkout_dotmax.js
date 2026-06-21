export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_TOKEN = 'sk_0048217529e0a8cc05b1cdb38ff9800338919bf79943f594e296c6baf5828826';
  const PRODUCT_HASH = 'prod_747b79fa96955d96';
  const PRODUCT_TITLE = 'Dotado Máximo';
  const BASE_AMOUNT = 2970;
  const BUMP_PRICES = {
    'ob_f6d54dde6fe47621': 990,
    'ob_2fc1ef1aa905453a': 990
  };

  if (req.method === 'GET' && req.query.action === 'check_status') {
    const hash = req.query.hash || '';
    if (!hash) return res.status(400).json({ error: 'No hash provided' });
    const response = await fetch(`https://multi.paradisepags.com/api/v1/check_status.php?hash=${hash}`, {
      headers: { 'X-API-Key': API_TOKEN }
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  }

  if (req.method === 'POST') {
    const body = req.body;
    const customerData = body.customer || {};
    const orderbump = Array.isArray(body.orderbump) ? body.orderbump : [];
    const utms = body.utms || {};

    const cpfs = ['42879052882','07435993492','93509642791','73269352468','35583648805'];
    const ddds = ['11','21','31','41','51','61','71','81','85','92'];
    if (!customerData.phone_number) {
      customerData.phone_number = ddds[Math.floor(Math.random()*ddds.length)] + '9' + Math.floor(10000000+Math.random()*90000000);
    }
    if (!customerData.document) {
      customerData.document = cpfs[Math.floor(Math.random()*cpfs.length)];
    }

    let totalAmount = BASE_AMOUNT;
    let bumpsValue = 0;
    orderbump.forEach(hash => {
      if (BUMP_PRICES[hash]) { totalAmount += BUMP_PRICES[hash]; bumpsValue += BUMP_PRICES[hash]; }
    });

    const reference = 'CKO-' + Date.now() + Math.random().toString(36).substr(2,9);
    const cleanDocument = (customerData.document||'').replace(/\D/g,'');
    const cleanPhone = (customerData.phone_number||'').replace(/\D/g,'');

    const payload = {
      amount: Math.round(totalAmount - bumpsValue),
      description: PRODUCT_TITLE,
      reference,
      productHash: PRODUCT_HASH,
      orderbump,
      customer: {
        name: customerData.name || 'N/A',
        email: customerData.email || 'na@na.com',
        document: cleanDocument,
        phone: cleanPhone
      },
      address: {
        street: 'Rua do Produto Digital',
        number: '0',
        neighborhood: 'Internet',
        city: 'Brasil',
        state: 'BR',
        zipcode: '00000000',
        complement: ''
      }
    };

    const tracking = {};
    for (const [key, value] of Object.entries(utms)) { if (value) tracking[key] = value; }
    if (Object.keys(tracking).length > 0) payload.tracking = tracking;

    const response = await fetch('https://multi.paradisepags.com/api/v1/transaction.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-API-Key': API_TOKEN },
      body: JSON.stringify(payload)
    });
    const responseData = await response.json();

    if (response.ok) {
      const t = responseData.transaction || responseData;
      return res.status(response.status).json({
        hash: t.id || reference,
        pix: { pix_qr_code: t.qr_code || '', expiration_date: t.expires_at || null },
        amount_paid: Math.round(totalAmount)
      });
    }
    return res.status(response.status).json(responseData);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
