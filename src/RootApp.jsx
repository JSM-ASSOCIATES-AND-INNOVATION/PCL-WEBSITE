import React, { Suspense } from 'react';
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
  const isErpRoute = window.location.pathname.toLowerCase().startsWith('/erp');
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
