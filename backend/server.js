import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-6915537395252772-072400-341a0f36f88b902e1bb2846d487a3af9-1104219206'
});

app.post('/api/create-preference', async (req, res) => {
  try {
    const { title, price, quantity = 1 } = req.body;
    
    console.log('📦 Creando preferencia para:', { title, price, quantity });
    
    const body = {
      items: [
        {
          title: title,
          quantity: Number(quantity),
          unit_price: Number(price),
          currency_id: 'USD',
        },
      ],
      back_urls: {
        success: 'http://localhost:5173/',
        failure: 'http://localhost:5173/',
        pending: 'http://localhost:5173/'
      }
      // ⚠️ IMPORTANTE: NO incluyas "auto_return" aquí
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });
    
    console.log('✅ Preferencia creada:', result.id);
    res.json({ preferenceId: result.id });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Error al crear la preferencia',
      message: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend Mercado Pago funcionando' });
});

app.listen(port, () => {
  console.log(`✅ Backend corriendo en http://localhost:${port}`);
  console.log(`💰 Moneda configurada: USD`);
});