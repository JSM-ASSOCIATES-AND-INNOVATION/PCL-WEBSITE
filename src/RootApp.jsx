import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import Preloader from './components/UI/Preloader/Preloader';
import ScrollToTop from './components/UI/ScrollToTop';
import App from './App';
import { ErpProvider } from './erp/context/ErpContext';
import ErpApp from './erp/ErpApp';

const ErpWrapper = () => {
  return (
    <Suspense fallback={<Preloader />}>
      <ErpProvider>
        <ErpApp />
      </ErpProvider>
    </Suspense>
  );
};

const RootApp = () => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const isErpRoute = path.startsWith('/erp') || 
                     path.startsWith('/login') || 
                     path.startsWith('/student') || 
                     path.startsWith('/faculty') || 
                     path.startsWith('/admin') || 
                     path.startsWith('/verify');
  return (
    <>
      <ScrollToTop />
      {isErpRoute ? <ErpWrapper /> : (
        <Suspense fallback={<Preloader />}>
          <App />
        </Suspense>
      )}
    </>
  );
};

export default RootApp;
