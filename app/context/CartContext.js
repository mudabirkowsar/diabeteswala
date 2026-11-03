"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the unified Cart Context
const CartContext = createContext(null);

// --- HTTP Request Utility ---
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
    const [foodCart, setFoodCart] = useState(null);

    // --- Pricing & Calculation States ---
    const [labCartTotal, setLabCartTotal] = useState(0);
    const [pharmacyCartTotal, setPharmacyCartTotal] = useState(0);
    const [foodCartTotal, setFoodCartTotal] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // --- Loading & Error Handling States ---
    const [loading, setLoading] = useState(false);

    // ==========================================
    //           LAB CART OPERATIONS
    // ==========================================

    // --- 1. Fetch Lab Cart Details (GET /user/cart/lab) ---
    const fetchLabCart = async () => {
        setLoading(true);
        try {
            const response = await authApi.get('/user/cart/lab');
            if (response.data && response.data.success) {
                setLabCart(response.data.data);
                setLabCartTotal(response.data.data?.labCartTotal || 0);
            } else {
                setLabCart(null);
                setLabCartTotal(0);
            }
        } catch (err) {
            console.error("Error fetching lab cart:", err);
            setLabCart(null);
            setLabCartTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. Add Item to Lab Cart (POST /user/cart/lab/add) ---
    // Handles multi-lab conflict (canReplace) and radiology bypass (confirmRadiologyBypass)
    const addToLabCart = async (payload) => {
        // payload: { labId, itemId, productType, forceReplace, confirmRadiologyBypass }
        try {
            const response = await authApi.post('/user/cart/lab/add', payload);
            if (response.data && response.data.success) {
                await fetchLabCart(); // Synchronize local state
            }
            return response.data;
        } catch (err) {
            // Backend returns HTTP 400 for canReplace & confirmRadiologyBypass warnings
            if (err.response && err.response.data) {
                return err.response.data;
            }
            console.error("Error adding item to lab cart:", err);
            throw err;
        }
    };

    // --- 3. Update Lab Item Quantity (PUT /user/cart/quantity) ---
    // FIXED: Changed endpoint from '/user/cart/lab/quantity' to '/user/cart/quantity'
    const updateLabItemQuantity = async (itemId, action) => {
        // action: 'inc' or 'dec'
        try {
            const response = await authApi.put('/user/cart/quantity', { itemId, action });
            if (response.data && response.data.success) {
                await fetchLabCart(); // Synchronize local state
            }
            return response.data;
        } catch (err) {
            console.error("Error updating lab item quantity:", err);
            throw err;
        }
    };

    // --- 4. Remove Lab Cart Item (DELETE /user/cart/item/:itemId) ---
    // FIXED: Changed endpoint from '/user/cart/lab/item/:itemId' to '/user/cart/item/:itemId'
    const removeLabCartItem = async (itemId) => {
        try {
            const response = await authApi.delete(`/user/cart/item/${itemId}`);
            if (response.data && response.data.success) {
                await fetchLabCart(); // Synchronize local state
            }
            return response.data;
        } catch (err) {
            console.error("Error removing lab item:", err);
            throw err;
        }
    };

    // --- 5. Clear Lab Cart (POST /user/cart/lab/clear) ---
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

    // ==========================================
    //        PHARMACY CART OPERATIONS
    // ==========================================

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

    const addToPharmacyCart = async (payload) => {
        try {
            const response = await authApi.post('/user/cart/pharmacy/add', payload);
            if (response.data && response.data.success) {
                await fetchPharmacyCart();
            }
            return response.data;
        } catch (err) {
            console.error("Error adding item to pharmacy cart:", err);
            throw err;
        }
    };

    const updatePharmacyItemQuantity = async (medicineId, action, isComboApplied = false) => {
        try {
            const response = await authApi.put('/user/cart/pharmacy/quantity', { medicineId, action, isComboApplied });
            if (response.data && response.data.success) {
                await fetchPharmacyCart();
            }
            return response.data;
        } catch (err) {
            console.error("Error updating pharmacy item quantity:", err);
            throw err;
        }
    };

    const removePharmacyItem = async (medicineId) => {
        try {
            const response = await authApi.delete(`/user/cart/pharmacy/item/${medicineId}`);
            if (response.data && response.data.success) {
                await fetchPharmacyCart();
            }
            return response.data;
        } catch (err) {
            console.error("Error removing pharmacy medicine item:", err);
            throw err;
        }
    };

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

    // ==========================================
    //           FOOD CART OPERATIONS
    // ==========================================

    const fetchFoodCart = async () => {
        setLoading(true);
        try {
            const response = await authApi.get('/user/cart/food');
            if (response.data && response.data.success) {
                setFoodCart(response.data.data);
                setFoodCartTotal(response.data.data?.foodCartTotal || 0);
            }
        } catch (err) {
            console.error("Error fetching food cart:", err);
        } finally {
            setLoading(false);
        }
    };

    const addToFoodCart = async (payload) => {
        try {
            const response = await authApi.post('/user/cart/food/add', payload);
            if (response.data && response.data.success) {
                await fetchFoodCart();
            }
            return response.data;
        } catch (err) {
            console.error("Error adding item to food cart:", err);
            throw err;
        }
    };

    const updateFoodItemQuantity = async (itemId, action) => {
        try {
            const response = await authApi.put('/user/cart/food/quantity', { itemId, action });
            if (response.data && response.data.success) {
                await fetchFoodCart();
            }
            return response.data;
        } catch (err) {
            console.error("Error updating food item quantity:", err);
            throw err;
        }
    };

    const removeFoodCartItem = async (itemId) => {
        try {
            const response = await authApi.delete(`/user/cart/food/item/${itemId}`);
            if (response.data && response.data.success) {
                await fetchFoodCart();
            }
            return response.data;
        } catch (err) {
            console.error("Error removing food item from cart:", err);
            throw err;
        }
    };

    const clearFoodCart = async () => {
        try {
            const response = await authApi.post('/user/cart/food/clear');
            if (response.data && response.data.success) {
                setFoodCart(null);
                setFoodCartTotal(0);
            }
            return response.data;
        } catch (err) {
            console.error("Error clearing full food cart:", err);
            throw err;
        }
    };

    // --- Auto Fetch and Sync Calculations ---
    useEffect(() => {
        const syncCarts = async () => {
            await Promise.allSettled([fetchLabCart(), fetchPharmacyCart(), fetchFoodCart()]);
        };
        syncCarts();
    }, []);

    // Monitor changes and calculate total items automatically
    useEffect(() => {
        const labItemsCount = labCart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        const pharmacyItemsCount = pharmacyCart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        const foodItemsCount = foodCart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        setTotalItems(labItemsCount + pharmacyItemsCount + foodItemsCount);
    }, [labCart, pharmacyCart, foodCart]);

    return (
        <CartContext.Provider value={{
            // Data States
            labCart,
            pharmacyCart,
            foodCart,
            loading,

            // Computations & Totals
            labCartTotal,
            pharmacyCartTotal,
            foodCartTotal,
            totalItems,

            // Sync/Fetch Actions
            fetchLabCart,
            fetchPharmacyCart,
            fetchFoodCart,

            // Lab Cart Operations
            addToLabCart,
            updateLabItemQuantity,
            removeLabCartItem,
            clearLabCart,

            // Pharmacy Cart Operations
            addToPharmacyCart,
            updatePharmacyItemQuantity,
            removePharmacyItem,
            clearPharmacyCart,

            // Food Cart Operations
            addToFoodCart,
            updateFoodItemQuantity,
            removeFoodCartItem,
            clearFoodCart
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