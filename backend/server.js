import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-6915537395252772-072400-341a0f36f88b902e1bb2846d487a3af9-1104219206'
});

// Tasa de cambio fija (actualiza según necesidad)
const USD_TO_UYU = 42.50;

// Endpoint principal para crear preferencia
app.post('/api/create-preference', async (req, res) => {
  try {
    const { title, price, quantity = 1 } = req.body;
    
    console.log('📦 Creando preferencia para:', { title, price, quantity });
    
    // Convertir USD a UYU
    const priceInUYU = Number((price * USD_TO_UYU).toFixed(2));
    console.log(`🔄 USD ${price} → UYU ${priceInUYU}`);
    
    // Configuración de la preferencia
    const body = {
      items: [
        {
          title: title,
          quantity: Number(quantity),
          unit_price: priceInUYU,
          currency_id: 'UYU',
        },
      ],
      back_urls: {
        success: 'http://localhost:5173/success',
        failure: 'http://localhost:5173/failure',
        pending: 'http://localhost:5173/pending'
      },
      notification_url: 'http://localhost:3000/api/webhook',
      statement_descriptor: 'MI TIENDA',
      external_reference: `orden_${Date.now()}`,
      // Opcional: Configurar métodos de pago
      payment_methods: {
        installments: 12,
        default_installments: 1
      }
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });
    
    console.log('✅ Preferencia creada:');
    console.log(`   ID: ${result.id}`);
    console.log(`   Precio: ${priceInUYU} UYU`);
    
    res.json({ 
      preferenceId: result.id,
      initPoint: result.init_point,
      priceUSD: price,
      priceUYU: priceInUYU,
      currency: 'UYU'
    });
    
  } catch (error) {
    console.error('❌ Error al crear preferencia:');
    console.error('   Mensaje:', error.message);
    if (error.cause) {
      console.error('   Detalles:', error.cause);
    }
    
    res.status(500).json({ 
      error: 'Error al crear la preferencia de pago',
      message: error.message,
      details: error.cause || 'Sin detalles adicionales'
    });
  }
});

// Webhook para recibir notificaciones de pago
app.post('/api/webhook', async (req, res) => {
  try {
    console.log('📩 Webhook recibido:');
    console.log(JSON.stringify(req.body, null, 2));
    
    const { type, data } = req.body;
    
    if (type === 'payment') {
      const paymentId = data.id;
      console.log(`✅ Pago ID ${paymentId} procesado`);
      // Aquí puedes actualizar tu base de datos
    }
    
    res.status(200).json({ message: 'Webhook procesado correctamente' });
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
});

// Endpoint para obtener la tasa de cambio actual
app.get('/api/exchange-rate', async (req, res) => {
  try {
    res.json({
      rate: USD_TO_UYU,
      currencyPair: 'USD/UYU',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo tasa de cambio' });
  }
});

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ Backend funcionando correctamente',
    status: 'online',
    exchangeRate: USD_TO_UYU,
    endpoints: {
      create_preference: 'POST /api/create-preference',
      webhook: 'POST /api/webhook',
      exchange_rate: 'GET /api/exchange-rate',
      test: 'GET /api/test'
    },
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Backend Mercado Pago funcionando',
    version: '1.0.0',
    exchangeRate: USD_TO_UYU,
    currency: 'UYU',
    endpoints: {
      create_preference: '/api/create-preference',
      webhook: '/api/webhook',
      exchange_rate: '/api/exchange-rate',
      test: '/api/test'
    }
  });
});

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  console.log('\n=================================');
  console.log('✅ Backend Mercado Pago CORRIENDO');
  console.log('=================================');
  console.log(`📍 Puerto: http://localhost:${port}`);
  console.log(`💰 Moneda: UYU (Peso Uruguayo)`);
  console.log(`💱 Tasa USD/UYU: ${USD_TO_UYU}`);
  console.log('=================================');
  console.log('📋 Endpoints disponibles:');
  console.log(`   POST /api/create-preference`);
  console.log(`   POST /api/webhook`);
  console.log(`   GET  /api/exchange-rate`);
  console.log(`   GET  /api/test`);
  console.log('=================================\n');
});