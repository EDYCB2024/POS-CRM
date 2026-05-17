import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AllyConfig, StatusConfig, DeviceModel } from "@/types/database";

const TABLE_SCHEMAS: Record<string, string[]> = {
  vatc: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "factura", "informe", "ingreso", "garantia", "informes", "categoria", "cotizacin", "fecha_final", "procesadora", "razon_social", "razn_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo", "repuesto__servicio_1", "repuesto__servicio_2", "repuesto__servicio_3"],
  banplus: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "repuesto__servicio", "serial_de_remplazo", "repuesto__servicio_2", "repuesto__servicio_3"],
  ccr: ["serial", "n", "ne", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "fecha_final", "razn_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo", "repuesto__servicio_1", "repuesto__servicio_2", "repuesto__servicio_3"],
  instapago: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  poscom: ["n", "rif", "fecha", "nivel", "aliado", "modelo", "serial", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "repuesto__servicio", "serial_de_remplazo", "repuesto__servicio_2", "repuesto__servicio_3"],
  exterior: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  bancaribe: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "repuesto__servicio", "serial_de_remplazo", "repuesto__servicio_2", "repuesto__servicio_3"],
  tokenp: ["n", "rif", "fecha", "nivel", "aliado", "modelo", "serial", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  bactivo: ["n", "rif", "fecha", "nivel", "aliado", "modelo", "serial", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  bancrecer: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  bestpay: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  delsur: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  paytech: ["serial", "n", "ne", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  platco: ["serial", "nro", "rif", "lote", "fecha", "nivel", "aliado", "modelo", "estatus", "ingreso", "categora", "garantia", "column_26", "columna_7", "cotizacin", "columna_10", "fecha_final", "fecha_venta", "razn_social", "razon_social", "observacion_2", "observaciones", "estatus_del_caso", "repuesto__servicio", "serial_de_remplazo", "repuesto__servicio_2", "repuesto__servicio_3", "imei_1", "imei_2", "fecha_entrega"],
  platco_pos: ["serial", "nro", "rif", "lote", "fecha", "nivel", "aliado", "modelo", "estatus", "ingreso", "categora", "garantia", "cotizacin", "fecha_final", "fecha_venta", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "repuesto__servicio", "serial_de_remplazo", "repuesto__servicio_2", "repuesto__servicio_3"],
  otros: ["n", "ne", "rif", "fecha", "nivel", "aliado", "modelo", "serial", "estatus", "informe", "ingreso", "categora", "garantia", "informes", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"]
};

export function useBulkAdd(isOpen: boolean, onClose: () => void, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [allies, setAllies] = useState<AllyConfig[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<{ linux: string[], android: string[] }>({ linux: [], android: [] });
  const [defaultAliados, setDefaultAliados] = useState<any[]>([]);
  
  const [selectedAlly, setSelectedAlly] = useState('');
  const [serialsText, setSerialsText] = useState('');
  const [model, setModel] = useState('N910');
  const [status, setStatus] = useState('POR DEFINIR');
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

          const { data: defaultsData } = await supabase
            .from('default_aliados')
            .select('*');

          setAllies(alliesData || []);
          if (statusData) setStatuses(statusData.map((s: { estatus: string }) => s.estatus).filter(Boolean));
          if (defaultsData) setDefaultAliados(defaultsData);
          
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
      .split(/[\n,]+/)
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
      const columns = TABLE_SCHEMAS[actualTableName] || [];
      
      // Fetch Next NID starting value
      const nidCol = columns.find(c => ['n', 'nro', 'ne'].includes(c));
      let currentMaxNid = 0;
      if (nidCol) {
        const { data } = await supabase
          .from(actualTableName)
          .select(nidCol)
          .not(nidCol, 'is', null)
          .order(nidCol, { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (data) {
          const lastId = parseInt((data as any)[nidCol]);
          currentMaxNid = isNaN(lastId) ? 0 : lastId;
        }
      }

      // Ally specific defaults from default_aliados
      const defaultData = defaultAliados.find(d =>
        d.aliado.toLowerCase() === selectedAlly.toLowerCase()
      );

      let defaultRif = 'PENDIENTE';
      let defaultRazonSocial = 'STOCK CRM';

      if (defaultData) {
        if (defaultData.rif && defaultData.rif !== 'PENDIENTE') {
          defaultRif = defaultData.rif;
        }
        if (defaultData.razon_social && defaultData.razon_social !== 'PENDIENTE') {
          defaultRazonSocial = defaultData.razon_social;
        }
      }
      
      const processedRows = await Promise.all(serialList.map(async (serial, index) => {
        const { count } = await supabase
          .from(actualTableName)
          .select('*', { count: 'exact', head: true })
          .eq('serial', serial);
        
        const nextIngreso = (count || 0) + 1;
        const rowNid = currentMaxNid + index + 1;

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

        const rawRow: any = {
          serial: serial,
          modelo: model,
          estatus: status,
          garantia: warranty.toUpperCase(),
          aliado: selectedAllyConfig?.name || selectedAlly,
          ingreso: nextIngreso.toString(),
          razon_social: externalData.razon_social || defaultRazonSocial,
          rif: externalData.rif || defaultRif,
          procesadora: externalData.procesadora || (actualTableName === 'vatc' ? 'PENDIENTE' : null),
          factura: externalData.factura || null,
          fecha_venta: externalData.fecha_venta || null,
          fecha: new Date().toISOString().split('T')[0],
          modificado_crm: true,
          estatus_del_caso: 'CASO ABIERTO'
        };

        if (nidCol) {
          rawRow[nidCol] = rowNid;
        }

        // Enlazar variaciones de campos en el aliado seleccionado
        if (columns.includes('razn_social') && !rawRow.hasOwnProperty('razn_social')) {
          rawRow['razn_social'] = rawRow['razon_social'];
        }
        if (columns.includes('categora') && !rawRow.hasOwnProperty('categora')) {
          rawRow['categora'] = 'POR DEFINIR';
        }
        if (columns.includes('categoria') && !rawRow.hasOwnProperty('categoria')) {
          rawRow['categoria'] = 'POR DEFINIR';
        }

        // Filtrar campos para incluir únicamente los existentes en el esquema del aliado seleccionado
        if (columns.length > 0) {
          const filteredRow: any = {};
          Object.keys(rawRow).forEach(key => {
            if (columns.includes(key) || key === 'modificado_crm') {
              filteredRow[key] = rawRow[key];
            }
          });
          return filteredRow;
        }

        return rawRow;
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

  const parsedCount = serialsText.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0).length;

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
