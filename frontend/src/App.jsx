import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.css';

import { useInitTheme } from './hooks/useInitTheme';

import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/Home';
import Catalog from './pages/Catalog';
import Callback from './pages/Callback';
import AccountPage from './pages/Account';
import ProductPage from './pages/Product';
import CheckoutPage from './pages/Checkout';

import Items from './admin/pages/Items';
import Users from './admin/pages/Users';
import Orders from './admin/pages/Orders';

function App() {
    useInitTheme();
    return (
        <BrowserRouter>
            <CartProvider>
                <NotificationProvider>
                    <Header />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/callback" element={<Callback />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/catalog" element={<Catalog />} />
                        <Route path="/products/:id" element={<ProductPage />} />
                        <Route path="/admin/items" element={<Items />} />
                        <Route path="/admin/users" element={<Users />} />
                        <Route path="/admin/orders" element={<Orders />} />
                    </Routes>
                </NotificationProvider>
            </CartProvider>
            <Footer />
        </BrowserRouter>
    );
}

export default App;