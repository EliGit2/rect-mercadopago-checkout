import { useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import './App.css';

// ⚠️ IMPORTANTE: Cambia por tu Public Key real de Mercado Pago
// La obtienes en: https://www.mercadopago.com.ar/developers/panel
initMercadoPago('APP_USR-7f22ae10-4ce9-4f77-a016-a69d0685fec6');

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(false);

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
        
        // ✅ Opcional: Abrir el pago en nueva pestaña
        // Descomenta las siguientes líneas si quieres que abra en nueva pestaña
        /*
        const paymentUrl = `https://www.mercadopago.com.uy/checkout/v1/redirect?pref_id=${data.preferenceId}`;
        window.open(paymentUrl, '_blank', 'noopener,noreferrer');
        handleCloseModal(); // Cierra el modal si quieres mantener la tienda
        */
        
      } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor de pagos');
        setIsModalOpen(false);
        setSelectedProduct(null);
      } finally {
        setLoading(false);
      }
    //};
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
                {/* ✅ Botón para volver a la tienda */}
                <button 
                  onClick={handleCloseModal}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '10px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                >
                  ← Volver a la tienda
                </button>
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