import { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { FaWhatsapp } from 'react-icons/fa'; // ← NUEVA IMPORTACIÓN
import './App.css';

// ⚠️ Coloca tu Public Key real aquí 
initMercadoPago('APP_USR-9fa877e1-b075-4dca-ad4f-785f6131aa17');

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);

  // Detectar si viene de un pago
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const collectionStatus = urlParams.get('collection_status');
    
    if (paymentStatus === 'approved' || collectionStatus === 'approved') {
      setPaymentMessage('🎉 ¡Pago aprobado! Gracias por tu compra.');
      setTimeout(() => setPaymentMessage(null), 5000);
    } else if (paymentStatus === 'failure' || collectionStatus === 'failure') {
      setPaymentMessage('❌ El pago no pudo procesarse. Intenta nuevamente.');
      setTimeout(() => setPaymentMessage(null), 5000);
    }
    
    // Limpiar la URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  const products = [
    {
      id: 1,
      title: 'Pc Gamer Core i7 8Gen',
      description: 'Core i7 8Gen, 32Gb Ram, Windows 11 Pro,Sistema operativo de 64 bits, procesador basado en x64, Almacenamiento 385 GB de 2,04 TB usado, Tarjeta grafica NVIDIA GeForce GTX 1050 Ti (4 GB), Ram 32,0 GB (31,9 GB usable), procesador Intel(R) Core(TM) i7-8700 CPU @ 3.20GHz (3.19 GHz), Camara USB logitech, Parlantes Genius USB 2.0 6W, tarjeta Madre ASROCK H310M-HDV P3.00 ',
      price: 900,
      image: 'images/publicidad.png?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Lectora Externa Nvme Md202',
      description: 'Bahia Externa Nvme Md202  Marca: Hiksemi',
      price: 25,
      image: 'images/LECTORAM2HIKSEMI.png?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Combo',
      description: 'MARVO CM310SP â€“ Combo Gaming 3 en 1 (Mousepad + Mouse + Teclado EspaÃ±ol) gaming con mousepad de tela de alta densidad resistente al agua, base de goma antideslizante y borde cosido (280 x 230 x 2 mm), mouse ergonÃ³mico ambidiestro hasta 3200 DPI (800-1200-2400-3200), 7 botones programables, RGB 7 colores, 1000 Hz, 10G, cable 1,6 m, y teclado espaÃ±ol de 87 teclas de doble disparo, membrana, retroiluminaciÃ³n arcoÃ­ris 3 colores, anti-ghosting 25 teclas, USB 2.0, cable 1,6 m; color negro/rojo.',
      price: 75,
      image: 'images/Combogaming.jpg?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      title: 'Pc Core i7 3Gen 12Gb Ram',
      description: 'Discos SSD 500GB, Tarjeta de video Geforce 4Gb',
      price: 680,
      image: 'images/PCi73gen.png?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      title: 'Parlantes Genius ',
      description: '2.0 Sp-HF180 6W usb, Tres colores disponibles (Madera oscuro, claro y negro)',
      price: 600,
      image: 'images/img2.png?w=400&h=300&fit=crop'
    },
    {
      id:6,
      title: 'Equipo Gamer Ryzen 5 3400Ghz',
      description: 'Gabinete Deepcool CC560 V2 (GAB156) Fuente Deepcool 450W 80 Plus (FUE134) Procesador AMD Ryzen 5 3400G Box 3.7Ghz AM4 (PRO262) Mother Biostar A520MHP (MOT148) 2 Memoria Lexar DDR4 8GB 3200Mhz (MEM437x2) Disco SSD Biostar 512GB (DIS430) Radeon RX Vega 11 Graphics',
      price: 700,
      image: 'images/pcGamer1.jpg?w=400&h=300&fit=crop'
    }
  ];

  const handleBuy = async (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setPreferenceId(null);
    setLoading(true);
    
    try {
      console.log('Conectando al backend...');
      
      const response = await fetch('http://localhost:3000/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: product.title,
          price: product.price,
          quantity: 1
        })
      });
      
      const data = await response.json();
      console.log('Preference ID:', data.preferenceId);
      setPreferenceId(data.preferenceId);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con el servidor de pagos');
      setIsModalOpen(false);
      setSelectedProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir en nueva pestaña
  const openInNewTab = () => {
    if (preferenceId) {
      const paymentUrl = `https://www.mercadopago.com.uy/checkout/v1/redirect?pref_id=${preferenceId}`;
      window.open(paymentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setPreferenceId(null);
    setLoading(false);
  };

  // NÚMERO DE WHATSAPP (configura aquí tu número)
  const phoneNumber = "59899949387"; // ← CAMBIA ESTE NÚMERO
  const whatsappMessage = "Hola! Me interesa un producto de su tienda Multiventas Elias";

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🛍️ Mi Tienda Online Multiventas Elias</h1>
          <p>Paga con Mercado Pago - Moneda USD</p>
        </header>

        {/* Mensaje de éxito/error después del pago */}
        {paymentMessage && (
          <div className={`payment-message ${paymentMessage.includes('aprobado') ? 'success' : 'error'}`}>
            {paymentMessage}
          </div>
        )}

        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.title} className="product-image" />
              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">
                  ${product.price.toLocaleString('en-US')} <span className="price-currency">USD</span>
                </div>
                <button className="buy-button" onClick={() => handleBuy(product)}>
                  Comprar ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de pago */}
      {isModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            
            <div className="modal-header">
              <h2>Completar pago</h2>
              <p className="modal-product">{selectedProduct.title}</p>
              <p className="modal-price">
                Total: ${selectedProduct.price.toLocaleString('es-UY')} <strong>UYU</strong>
              </p>
            </div>

            <div className="modal-body">
              {loading ? (
                <div className="loading-payment">
                  <div className="spinner"></div>
                  <p>Conectando con el servidor...</p>
                </div>
              ) : preferenceId ? (
                <>
                  {/* Wallet de Mercado Pago */}
                  <div className="wallet-container">
                    <Wallet
                      initialization={{ preferenceId: preferenceId }}
                      onError={(error) => {
                        console.error('❌ Error en Wallet:', error);
                        alert('Error al cargar Mercado Pago');
                      }}
                      onReady={() => console.log('✅ Wallet listo')}
                    />
                  </div>
                  
                  <div className="wallet-separator"></div>
                  
                  {/* Botones adicionales */}
                  <div className="modal-buttons">
                    <button 
                      className="new-tab-btn"
                      onClick={openInNewTab}
                    >
                      🔗 Abrir pago en nueva pestaña
                    </button>
                    
                    <button 
                      className="back-to-shop-btn"
                      onClick={handleCloseModal}
                    >
                      ← Volver a la tienda
                    </button>
                  </div>
                </>
              ) : (
                <div className="loading-payment">
                  <div className="spinner"></div>
                  <p>Preparando el pago...</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
        
      )}

      {/* ==== BOTÓN DE CONTACTOS EXISTENTE (lo dejamos igual) ==== */}
      <button className="button">
        <h1>🛍️ Contactos</h1>
        <p>Telf. : 099 94 93 87</p>
        <p>Email: ventajudaicavnzla@gmail.com</p>
      </button>
      <p>Contactos</p>
      <p>+598 099 94 93 87</p>

      {/* ===== NUEVO BOTÓN FLOTANTE DE WHATSAPP ===== */}
      <a
        href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Contactar por WhatsApp"
      >
        <FaWhatsapp className="whatsapp-icon" />
        <span className="whatsapp-tooltip">¡Chatea con nosotros!</span>
      </a>
    </div>
  );
}

export default App;