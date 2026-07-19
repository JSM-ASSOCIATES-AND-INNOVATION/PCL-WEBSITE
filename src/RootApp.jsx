/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import Preloader from './COMPONENTS/UI/Preloader/Preloader';
import ScrollToTop from './COMPONENTS/UI/ScrollToTop';
import App from './App';
import { SiteProvider } from './CONTEXT/SiteContext';
import { ErpProvider } from './ERP/context/ErpContext';
import ErpApp from './ERP/ErpApp';

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
        <SiteProvider>
          <Suspense fallback={<Preloader />}>
            <App />
          </Suspense>
        </SiteProvider>
      )}
    </>
  );
};

export default RootApp;
