import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AllyConfig, StatusConfig, DeviceModel } from "@/types/database";

export function useBulkAdd(isOpen: boolean, onClose: () => void, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [allies, setAllies] = useState<AllyConfig[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<{ linux: string[], android: string[] }>({ linux: [], android: [] });
  
  const [selectedAlly, setSelectedAlly] = useState('');
  const [serialsText, setSerialsText] = useState('');
  const [model, setModel] = useState('N910');
  const [status, setStatus] = useState('DISPONIBLE');
  const [warranty, setWarranty] = useState('POR DEFINIR');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const { data: alliesData } = await supabase
            .from('allies_config')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true });

          const { data: statusData } = await supabase
            .from('estatus')
            .select('estatus')
            .order('estatus');

          const { data: modData } = await supabase
            .from('modelos')
            .select('linux, android')
            .order('id');

          setAllies(alliesData || []);
          if (statusData) setStatuses(statusData.map((s: { estatus: string }) => s.estatus).filter(Boolean));
          
          if (modData) {
            const linux = Array.from(new Set(modData.map((m: { linux: string | null }) => m.linux).filter(Boolean))) as string[];
            const android = Array.from(new Set(modData.map((m: { android: string | null }) => m.android).filter(Boolean))) as string[];
            setAvailableModels({ linux, android });
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('No se pudieron cargar los datos necesarios');
        } finally {
          setFetchingData(false);
        }
      };
      fetchData();
    } else {
      setSerialsText('');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const serialList = serialsText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (!selectedAlly) {
      setError('Debes seleccionar un aliado');
      return;
    }

    if (serialList.length === 0) {
      setError('Debes ingresar al menos un serial');
      return;
    }

    setLoading(true);
    try {
      const selectedAllyConfig = allies.find(a => a.name === selectedAlly);
      const actualTableName = selectedAllyConfig?.table_name || selectedAlly;
      
      const processedRows = await Promise.all(serialList.map(async (serial) => {
        const { count } = await supabase
          .from(actualTableName)
          .select('*', { count: 'exact', head: true })
          .eq('serial', serial);
        
        const nextIngreso = (count || 0) + 1;

        let externalData: any = {};
        if (actualTableName === 'vatc') {
          const { data } = await supabase
            .from('bd_clientes')
            .select('razon, cliente, procesadora')
            .eq('serial', serial);
          
          if (data && data.length > 0) {
            const latest = data[data.length - 1];
            externalData = {
              razon_social: latest.razon,
              rif: latest.cliente,
              procesadora: latest.procesadora,
              factura: 'CARGA MASIVA'
            };
          }
        } else if (actualTableName === 'platco' || actualTableName === 'platco_pos') {
          const { data } = await supabase
            .from('bd_platco')
            .select('fecha_de_entrega')
            .eq('seriales', serial);
          
          if (data && data.length > 0) {
            externalData = {
              fecha_venta: data[data.length - 1].fecha_de_entrega
            };
          }
        }

        return {
          serial: serial,
          modelo: model,
          estatus: status,
          garantia: warranty.toUpperCase(),
          aliado: selectedAllyConfig?.name || selectedAlly,
          ingreso: nextIngreso.toString(),
          razon_social: externalData.razon_social || 'STOCK CRM',
          rif: externalData.rif || 'PENDIENTE',
          procesadora: externalData.procesadora || (actualTableName === 'vatc' ? 'PENDIENTE' : null),
          factura: externalData.factura || null,
          fecha_venta: externalData.fecha_venta || null,
          fecha: new Date().toISOString().split('T')[0],
          modificado_crm: true,
          estatus_del_caso: 'CASO ABIERTO'
        };
      }));

      const { error: insertError } = await supabase
        .from(actualTableName)
        .insert(processedRows);

      if (insertError) throw insertError;

      setSuccess(`Se han añadido ${serialList.length} equipos exitosamente a ${selectedAllyConfig?.name || selectedAlly}`);
      setSerialsText('');
      
      await supabase.from('activity_logs').insert({
        type: 'update',
        message: `Carga masiva de ${serialList.length} equipos en ${selectedAllyConfig?.name || selectedAlly}`,
        details: { ally: selectedAlly, count: serialList.length }
      });

      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Error in bulk add:', err);
      setError(`Error: ${err.message || 'No se pudo completar la carga masiva'}`);
    } finally {
      setLoading(false);
    }
  };

  const parsedCount = serialsText.split('\n').filter(s => s.trim().length > 0).length;

  return {
    loading,
    fetchingData,
    allies,
    statuses,
    availableModels,
    selectedAlly,
    setSelectedAlly,
    serialsText,
    setSerialsText,
    model,
    setModel,
    status,
    setStatus,
    warranty,
    setWarranty,
    error,
    success,
    handleProcess,
    parsedCount
  };
}
