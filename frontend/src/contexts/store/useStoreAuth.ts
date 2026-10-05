'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Address, Customer } from '@/types/commerce';
import { customers as seedCustomers, currentUserAddresses } from '@/data/customers';
import { authService } from '@/services/auth';
import { addressService } from '@/services/address-service';
import type { User } from './types';

export function useStoreAuth() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = authService.getStoredUser();
    if (stored) {
      return {
        id: stored.id,
        name: stored.name || stored.email?.split('@')[0] || 'User',
        email: stored.email,
        phone: stored.phone || '',
        role: stored.role,
      };
    }
    return null;
  });

  const [addresses, setAddresses] = useState<Address[]>(currentUserAddresses);
  const [isAddressesLoading, setIsAddressesLoading] = useState<boolean>(false);
  const [storeCredit] = useState(450);
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);

  // Helper to load addresses from backend database for authenticated users
  const loadAddressesFromBackend = useCallback(async () => {
    const token = authService.getStoredUser();
    if (!token) return;

    try {
      setIsAddressesLoading(true);
      const res = await addressService.getAddresses();
      if (res?.data && Array.isArray(res.data)) {
        const mappedAddresses: Address[] = res.data.map((item) => ({
          id: item.id,
          label: item.label,
          name: item.name,
          phone: item.phone,
          line1: item.line1,
          district: item.district,
          area: item.area,
          isDefaultShipping: !!item.isDefaultShipping,
          isDefaultBilling: !!item.isDefaultBilling,
        }));
        setAddresses(mappedAddresses);
      }
    } catch (err) {
      console.warn('Could not load customer addresses from backend:', err);
    } finally {
      setIsAddressesLoading(false);
    }
  }, []);

  // Re-sync session state and fetch addresses on mount and when user changes
  useEffect(() => {
    const stored = authService.getStoredUser();
    if (stored) {
      setUser({
        id: stored.id,
        name: stored.name || stored.email?.split('@')[0] || 'User',
        email: stored.email,
        phone: stored.phone || '',
        role: stored.role,
      });
      loadAddressesFromBackend();
    } else {
      setAddresses(currentUserAddresses);
    }
  }, [loadAddressesFromBackend]);

  const login = useCallback((_email: string) => {
    const stored = authService.getStoredUser();
    if (stored) {
      setUser({
        id: stored.id,
        name: stored.name,
        email: stored.email,
        phone: stored.phone || '',
        role: stored.role,
      });
      loadAddressesFromBackend();
    }
  }, [loadAddressesFromBackend]);

  const register = useCallback((u: Omit<User, 'id'>) => {
    const stored = authService.getStoredUser();
    if (stored) {
      setUser({
        id: stored.id,
        name: stored.name,
        email: stored.email,
        phone: stored.phone || '',
        role: stored.role,
      });
      loadAddressesFromBackend();
    } else {
      setUser({ ...u, id: u.email, role: 'CUSTOMER' });
    }
  }, [loadAddressesFromBackend]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setAddresses(currentUserAddresses);
  }, []);

  const saveAddress = useCallback(async (a: Address) => {
    // 1. Optimistic local state update
    setAddresses((prev) => {
      const exists = prev.some((x) => x.id === a.id);
      let next = exists ? prev.map((x) => (x.id === a.id ? a : x)) : [...prev, a];
      if (a.isDefaultShipping) {
        next = next.map((x) => ({ ...x, isDefaultShipping: x.id === a.id }));
      }
      return next;
    });

    // 2. Persist to Backend if logged in
    const stored = authService.getStoredUser();
    if (stored) {
      try {
        const isExistingInDb = a.id && !a.id.startsWith('a') && a.id.length > 10;
        if (isExistingInDb) {
          const res = await addressService.updateAddress(a.id, {
            label: a.label,
            name: a.name,
            phone: a.phone,
            line1: a.line1,
            district: a.district,
            area: a.area,
            isDefaultShipping: a.isDefaultShipping,
            isDefaultBilling: a.isDefaultBilling,
          });
          if (res?.data) {
            setAddresses((prev) =>
              prev.map((item) => (item.id === a.id ? { ...item, ...res.data } : item))
            );
          }
        } else {
          const res = await addressService.saveAddress({
            label: a.label || 'Home',
            name: a.name,
            phone: a.phone,
            line1: a.line1,
            district: a.district,
            area: a.area,
            isDefaultShipping: a.isDefaultShipping,
            isDefaultBilling: a.isDefaultBilling,
          });
          if (res?.data) {
            // Replace temporary optimistic ID with database generated UUID
            setAddresses((prev) => {
              const filtered = prev.filter((item) => item.id !== a.id);
              const mapped: Address = {
                id: res.data.id,
                label: res.data.label,
                name: res.data.name,
                phone: res.data.phone,
                line1: res.data.line1,
                district: res.data.district,
                area: res.data.area,
                isDefaultShipping: !!res.data.isDefaultShipping,
                isDefaultBilling: !!res.data.isDefaultBilling,
              };
              let next = [...filtered, mapped];
              if (mapped.isDefaultShipping) {
                next = next.map((x) => ({ ...x, isDefaultShipping: x.id === mapped.id }));
              }
              return next;
            });
            return res.data;
          }
        }
      } catch (error) {
        console.error('Failed to persist address to backend:', error);
      }
    }
    return a;
  }, []);

  const deleteAddress = useCallback(async (id: string) => {
    // 1. Optimistic local deletion
    setAddresses((prev) => prev.filter((a) => a.id !== id));

    // 2. Persist to backend
    const stored = authService.getStoredUser();
    if (stored && id && !id.startsWith('a') && id.length > 10) {
      try {
        await addressService.deleteAddress(id);
      } catch (error) {
        console.error('Failed to delete address from backend:', error);
      }
    }
  }, []);

  const setDefaultAddress = useCallback(async (id: string) => {
    // 1. Optimistic local update
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefaultShipping: a.id === id })));

    // 2. Persist to backend
    const stored = authService.getStoredUser();
    if (stored && id && !id.startsWith('a') && id.length > 10) {
      try {
        await addressService.updateAddress(id, { isDefaultShipping: true });
      } catch (error) {
        console.error('Failed to update default address on backend:', error);
      }
    }
  }, []);

  const toggleCustomerStatus = useCallback((id: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
      )
    );
  }, []);

  return {
    user,
    setUser,
    addresses,
    isAddressesLoading,
    storeCredit,
    customers,
    login,
    register,
    logout,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
    loadAddressesFromBackend,
    toggleCustomerStatus,
  };
}
