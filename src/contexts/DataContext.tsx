import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, testSupabaseConnection } from '../lib/supabase';

// Database types
export interface CryptoTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_url: string;
  premium: boolean;
  rating: number;
  url: string;
  affiliate_url?: string;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface ICOProject {
  id: string;
  name: string;
  symbol: string;
  description: string;
  start_date: string;
  end_date: string;
  target: string;
  raised: string;
  participants: number;
  rating: number;
  category: string;
  icon_url: string;
  status: 'upcoming' | 'active' | 'completed';
  website?: string;
  whitepaper?: string;
  social?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface PropFirm {
  id: string;
  name: string;
  icon_url: string;
  description: string;
  min_capital: string;
  max_capital: string;
  profit_split: string;
  max_drawdown: string;
  trading_period: string;
  challenge: boolean;
  instruments: string[];
  rating: number;
  reviews: number;
  features: string[];
  offers: string[];
  highlights: string[];
  website?: string;
  affiliate_url?: string;
  created_at: string;
  updated_at: string;
}

interface DataContextType {
  tools: CryptoTool[];
  icos: ICOProject[];
  propFirms: PropFirm[];
  loading: boolean;
  isSupabaseConnected: boolean;
  connectionError: string | null;
  addTool: (tool: Omit<CryptoTool, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addICO: (ico: Omit<ICOProject, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addPropFirm: (firm: Omit<PropFirm, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTool: (id: string, tool: Partial<CryptoTool>) => Promise<void>;
  updateICO: (id: string, ico: Partial<ICOProject>) => Promise<void>;
  updatePropFirm: (id: string, firm: Partial<PropFirm>) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;
  deleteICO: (id: string) => Promise<void>;
  deletePropFirm: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tools, setTools] = useState<CryptoTool[]>([]);
  const [icos, setIcos] = useState<ICOProject[]>([]);
  const [propFirms, setPropFirms] = useState<PropFirm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      // Test Supabase connection
      const connected = await testSupabaseConnection();
      setIsSupabaseConnected(connected);
      
      if (!connected) {
        setConnectionError('Supabase not connected. Please click "Connect to Supabase" to set up your database.');
        setTools([]);
        setIcos([]);
        setPropFirms([]);
        return;
      }

      // Fetch data from Supabase
      const [toolsResponse, icosResponse, propFirmsResponse] = await Promise.all([
        supabase.from('crypto_tools').select('*').order('created_at', { ascending: false }),
        supabase.from('ico_projects').select('*').order('created_at', { ascending: false }),
        supabase.from('prop_firms').select('*').order('created_at', { ascending: false })
      ]);

      if (toolsResponse.error) throw toolsResponse.error;
      if (icosResponse.error) throw icosResponse.error;
      if (propFirmsResponse.error) throw propFirmsResponse.error;

      setTools(toolsResponse.data || []);
      setIcos(icosResponse.data || []);
      setPropFirms(propFirmsResponse.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setConnectionError(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSupabaseConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addTool = async (tool: Omit<CryptoTool, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isSupabaseConnected) {
      throw new Error('Database not connected. Please connect to Supabase first.');
    }

    try {
      const { data, error } = await supabase
        .from('crypto_tools')
        .insert([tool])
        .select()
        .single();

      if (error) throw error;
      setTools(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding tool:', error);
      throw error;
    }
  };

  const addICO = async (ico: Omit<ICOProject, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isSupabaseConnected) {
      throw new Error('Database not connected. Please connect to Supabase first.');
    }

    try {
      const { data, error } = await supabase
        .from('ico_projects')
        .insert([ico])
        .select()
        .single();

      if (error) throw error;
      setIcos(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding ICO:', error);
      throw error;
    }
  };

  const addPropFirm = async (firm: Omit<PropFirm, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isSupabaseConnected) {
      throw new Error('Database not connected. Please connect to Supabase first.');
    }

    try {
      const { data, error } = await supabase
        .from('prop_firms')
        .insert([firm])
        .select()
        .single();

      if (error) throw error;
      setPropFirms(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding prop firm:', error);
      throw error;
    }
  };

  const updateTool = async (id: string, updates: Partial<CryptoTool>) => {
    if (!isSupabaseConnected) {
      throw new Error('Database not connected. Please connect to Supabase first.');
    }

    try {
      const { data, error } = await supabase
        .from('crypto_tools')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTools(prev => prev.map(tool => tool.id === id ? data : tool));
    } catch (error) {
      console.error('Error updating tool:', error);
      throw error;
    }
  };

  const updateICO = async (id: string, updates: Partial<ICOProject>) => {
    if (!isSupabaseConnected) {
      throw new Error('Database not connected. Please connect to Supabase first.');
    }

    try {
      const { data, error } = await supabase
        .from('ico_projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setIcos(prev => prev.map(ico => ico.id === id ? data : ico));
    } catch (error) {
      console.error('Error updating ICO:', error);
      throw error;
    }
  };

  const updatePropFirm = async (id: string, updates: Partial<PropFirm>) => {
    if (!isSupabaseConnected) {
      throw new Error('Database not connected. Please connect to Supabase first.');
    }

    try {
      const { data, error } = await supabase
        .from('prop_firms')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPropFirms(prev => prev.map(firm => firm.id === id ? data : firm));
    } catch (error) {
      console.error('Error updating prop firm:', error);
      throw error;
    }
  };

  const deleteTool = async (id: string) => {
    if (!isSupabaseConnected) {
      throw new Error('Database not connected. Please connect to Supabase first.');
    }

    try {
      const { error } = await supabase
        .from('crypto_tools')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTools(prev => prev.filter(tool => tool.id !== id));
    } catch (error) {
      console.error('Error deleting tool:', error);
      throw error;
    }
  };

  const deleteICO = async (id: string) => {
    if (!isSupabaseConnected) {
      throw new Error('Database not connected. Please connect to Supabase first.');
    }

    try {
      const { error } = await supabase
        .from('ico_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setIcos(prev => prev.filter(ico => ico.id !== id));
    } catch (error) {
      console.error('Error deleting ICO:', error);
      throw error;
    }
  };

  const deletePropFirm = async (id: string) => {
    if (!isSupabaseConnected) {
      throw new Error('Database not connected. Please connect to Supabase first.');
    }

    try {
      const { error } = await supabase
        .from('prop_firms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPropFirms(prev => prev.filter(firm => firm.id !== id));
    } catch (error) {
      console.error('Error deleting prop firm:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <DataContext.Provider value={{
      tools,
      icos,
      propFirms,
      loading,
      isSupabaseConnected,
      connectionError,
      addTool,
      addICO,
      addPropFirm,
      updateTool,
      updateICO,
      updatePropFirm,
      deleteTool,
      deleteICO,
      deletePropFirm,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}