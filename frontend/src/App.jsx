import { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import './App.css';

// ⚠️ Coloca tu Public Key real aquí
initMercadoPago('APP_USR-TU_PUBLIC_KEY_REAL_AQUI');

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
      title: 'Camiseta Deportiva Premium',
      description: 'Camiseta 100% algodón orgánico. Talles: S, M, L, XL.',
      price: 3500,
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Short Deportivo',
      description: 'Short cómodo para running y entrenamiento.',
      price: 2800,
      image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Zapatillas Running',
      description: 'Zapatillas con amortiguación. Talles 36-44.',
      price: 12500,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      title: 'Gorra Deportiva',
      description: 'Gorra unisex con protección UV.',
      price: 1800,
      image: 'https://images.unsplash.com/photo-1588850571411-7f41d2e9c6d6?w=400&h=300&fit=crop'
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

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🛍️ Mi Tienda Online</h1>
          <p>Paga con Mercado Pago - Moneda UYU</p>
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
                  ${product.price.toLocaleString('es-UY')} <span className="price-currency">UYU</span>
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
    </div>
  );
}

export default App;