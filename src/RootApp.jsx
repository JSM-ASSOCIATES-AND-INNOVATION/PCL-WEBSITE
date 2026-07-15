/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import React, { Suspense } from 'react';
import Preloader from './COMPONENTS/UI/PRELOADER/Preloader';
import ScrollToTop from './COMPONENTS/UI/ScrollToTop';
import App from './App';
import { ErpProvider } from './ERP/CONTEXT/ErpContext';
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
