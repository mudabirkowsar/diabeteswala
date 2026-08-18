"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the unified Cart Context
const CartContext = createContext(null);

// --- HTTP Request Utility ---
// Replace this with your standard axios instance or path if importing globally
const authApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || '',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add interceptor to dynamically inject the user bearer token before requests
authApi.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const CartProvider = ({ children }) => {
    // --- Cart Data States ---
    const [labCart, setLabCart] = useState(null);
    const [pharmacyCart, setPharmacyCart] = useState(null);

    // --- Pricing & Calculation States ---
    const [labCartTotal, setLabCartTotal] = useState(0);
    const [pharmacyCartTotal, setPharmacyCartTotal] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // --- Loading & Error Handling States ---
    const [loading, setLoading] = useState(false);

    // --- 1. Fetch Lab Cart Details ---
    const fetchLabCart = async () => {
        setLoading(true);
        try {
            const response = await authApi.get('/user/cart/lab');
            if (response.data && response.data.success) {
                setLabCart(response.data.data);
                setLabCartTotal(response.data.data?.labCartTotal || 0);
            }
        } catch (err) {
            console.error("Error fetching lab cart:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. Add Item to Lab Cart ---
    const addToLabCart = async (payload) => {
        // payload: { labId, itemId, productType, forceReplace, confirmRadiologyBypass }
        try {
            const response = await authApi.post('/user/cart/lab/add', payload);
            if (response.data && response.data.success) {
                await fetchLabCart(); // Synchronize local state
            }
            return response.data;
        } catch (err) {
            console.error("Error adding item to lab cart:", err);
            throw err;
        }
    };

    // --- 3. Update Lab Item Quantity ---
    const updateLabItemQuantity = async (itemId, action) => {
        // action: 'inc' or 'dec'
        try {
            const response = await authApi.put('/user/cart/lab/quantity', { itemId, action });
            if (response.data && response.data.success) {
                await fetchLabCart(); // Synchronize local state
            }
            return response.data;
        } catch (err) {
            console.error("Error updating lab item quantity:", err);
            throw err;
        }
    };

    // --- 4. Remove Lab Cart Item ---
    const removeLabCartItem = async (itemId) => {
        try {
            const response = await authApi.delete(`/user/cart/lab/item/${itemId}`);
            if (response.data && response.data.success) {
                await fetchLabCart(); // Synchronize local state
            }
            return response.data;
        } catch (err) {
            console.error("Error removing lab item:", err);
            throw err;
        }
    };

    // --- 5. Clear Lab Cart ---
    const clearLabCart = async () => {
        try {
            const response = await authApi.post('/user/cart/lab/clear');
            if (response.data && response.data.success) {
                setLabCart(null);
                setLabCartTotal(0);
            }
            return response.data;
        } catch (err) {
            console.error("Error clearing lab cart:", err);
            throw err;
        }
    };

    // --- 8. Fetch Pharmacy Cart Details ---
    const fetchPharmacyCart = async () => {
        setLoading(true);
        try {
            const response = await authApi.get('/user/cart/pharmacy');
            if (response.data && response.data.success) {
                setPharmacyCart(response.data.data);
                setPharmacyCartTotal(response.data.data?.pharmacyCartTotal || 0);
            }
        } catch (err) {
            console.error("Error fetching pharmacy cart:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- 9. Add Item to Pharmacy Cart ---
    const addToPharmacyCart = async (payload) => {
        // payload: { pharmacyId, medicineId, quantity, duration, forceReplace, isComboApplied, comboOfferId }
        try {
            const response = await authApi.post('/user/cart/pharmacy/add', payload);
            if (response.data && response.data.success) {
                await fetchPharmacyCart(); // Synchronize local state
            }
            return response.data;
        } catch (err) {
            console.error("Error adding item to pharmacy cart:", err);
            throw err;
        }
    };

    // --- 10. Update Pharmacy Item Quantity ---
    const updatePharmacyItemQuantity = async (medicineId, action, isComboApplied = false) => {
        // action: 'inc' or 'dec'
        try {
            const response = await authApi.put('/user/cart/pharmacy/quantity', { medicineId, action, isComboApplied });
            if (response.data && response.data.success) {
                await fetchPharmacyCart(); // Synchronize local state
            }
            return response.data;
        } catch (err) {
            console.error("Error updating pharmacy item quantity:", err);
            throw err;
        }
    };

    // --- 11. Remove Pharmacy Item ---
    const removePharmacyItem = async (medicineId) => {
        try {
            const response = await authApi.delete(`/user/cart/pharmacy/item/${medicineId}`);
            if (response.data && response.data.success) {
                await fetchPharmacyCart(); // Synchronize local state
            }
            return response.data;
        } catch (err) {
            console.error("Error removing pharmacy medicine item:", err);
            throw err;
        }
    };

    // --- 12. Clear Pharmacy Cart ---
    const clearPharmacyCart = async () => {
        try {
            const response = await authApi.post('/user/cart/pharmacy/clear');
            if (response.data && response.data.success) {
                setPharmacyCart(null);
                setPharmacyCartTotal(0);
            }
            return response.data;
        } catch (err) {
            console.error("Error clearing pharmacy cart:", err);
            throw err;
        }
    };


    // --- Auto Fetch and Sync Calculations ---
    useEffect(() => {
        // Fetch cart lists once when the Context Provider is initialized on Client
        const syncCarts = async () => {
            await Promise.allSettled([fetchLabCart(), fetchPharmacyCart()]);
        };
        syncCarts();
    }, []);

    // Monitor changes and calculate total items in the ecosystem automatically
    useEffect(() => {
        const labItemsCount = labCart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        const pharmacyItemsCount = pharmacyCart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        setTotalItems(labItemsCount + pharmacyItemsCount);
    }, [labCart, pharmacyCart]);

    return (
        <CartContext.Provider value={{
            // Data States
            labCart,
            pharmacyCart,
            loading,
            
            // Computations & Totals
            labCartTotal,
            pharmacyCartTotal,
            totalItems,

            // Sync/Fetch Actions
            fetchLabCart,
            fetchPharmacyCart,

            // Lab Cart Operations (1-7)
            addToLabCart,
            updateLabItemQuantity,
            removeLabCartItem,
            clearLabCart,

            // Pharmacy Cart Operations (8-14)
            addToPharmacyCart,
            updatePharmacyItemQuantity,
            removePharmacyItem,
            clearPharmacyCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom Hook to consume cart utilities anywhere
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used inside a CartProvider");
    }
    return context;
};