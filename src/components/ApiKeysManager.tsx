import { Check, Copy, KeyRound, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_BASE } from '../config/env';
import { createApiKeyRequest, fetchApiKeysRequest, revokeApiKeyRequest } from '../services/api';
import { type UserApiKey } from '../types/user';

const AVAILABLE_SCOPES = [
  { id: 'catalog:read', label: 'Leer Catálogo' },
  { id: 'balance:read', label: 'Ver Saldo' },
  { id: 'orders:read', label: 'Consultar Órdenes' },
  { id: 'orders:write', label: 'Crear Órdenes (gasta saldo)' }
];

export function ApiKeysManager({ compact = false }: { compact?: boolean }) {
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('sandbox');
  const [allowedIps, setAllowedIps] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'catalog:read',
    'balance:read',
    'orders:read',
    'orders:write'
  ]);
  const [newPlainKey, setNewPlainKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeysRequest()
      .then((res) => setKeys(res.apiKeys))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedScopes.length === 0) {
      return;
    }
    setErrorMsg(null);
    setCreating(true);
    try {
      const res = await createApiKeyRequest({
        name: name.trim(),
        environment,
        scopes: selectedScopes,
        allowedIps: allowedIps.trim() || undefined
      });
      setNewPlainKey(res.plainKey);
      setKeys((prev) => [res.apiKey, ...prev]);
      setName('');
      setAllowedIps('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo generar la API Key.');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setErrorMsg(null);
    try {
      await revokeApiKeyRequest(id);
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, active: false, revokedAt: new Date().toISOString() } : k))
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo revocar la API Key.');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(true);
    window.setTimeout(() => setCopiedKey(false), 2200);
  };

  const v1Base = `${API_BASE}/v1`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {errorMsg && (
        <div className="nc-auth-error" role="alert">
          {errorMsg}
        </div>
      )}

      {newPlainKey && (
        <div className="nc-reseller-sim" style={{ borderColor: 'rgba(250, 204, 21, 0.5)' }}>
          <strong style={{ display: 'block', marginBottom: 6, color: '#facc15' }}>
            Copia tu nueva API Key ahora (no se volverá a mostrar):
          </strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <code className="nc-mono" style={{ fontSize: '0.78rem', wordBreak: 'break-all', flex: 1 }}>
              {newPlainKey}
            </code>
            <button
              type="button"
              className="nc-btn nc-btn-gold nc-btn-sm"
              onClick={() => handleCopy(newPlainKey)}
            >
              {copiedKey ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedKey ? 'Copiada' : 'Copiar'}</span>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la llave (ej: Bot Tienda)"
            className="nc-input"
            style={{ flex: 1, minWidth: 160 }}
          />
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as 'production' | 'sandbox')}
            className="nc-input"
            style={{ width: 'auto', minWidth: 150 }}
            aria-label="Entorno de API Key"
          >
            <option value="sandbox">Sandbox (Pruebas)</option>
            <option value="production">Producción (Real)</option>
          </select>
          {!compact && (
            <input
              type="text"
              value={allowedIps}
              onChange={(e) => setAllowedIps(e.target.value)}
              placeholder="IPs permitidas (opcional, sep. por coma)"
              className="nc-input nc-mono"
              style={{ flex: 1, minWidth: 200 }}
            />
          )}
          <button type="submit" disabled={creating} className="nc-btn nc-btn-gold nc-btn-sm">
            <Plus size={15} />
            <span>{creating ? 'Generando...' : 'Generar API Key'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.78rem' }}>
          {AVAILABLE_SCOPES.map((sc) => (
            <label key={sc.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedScopes.includes(sc.id)}
                onChange={() => toggleScope(sc.id)}
              />
              <span>{sc.label}</span>
            </label>
          ))}
        </div>
      </form>

      <div className="nc-profile-list">
        {loading ? (
          <p className="nc-profile-empty">Cargando API Keys...</p>
        ) : keys.length === 0 ? (
          <p className="nc-profile-empty">Aún no tienes API Keys generadas.</p>
        ) : (
          keys.map((k) => (
            <div key={k.id} className="nc-profile-row-card">
              <div>
                <strong>
                  <KeyRound size={13} style={{ display: 'inline', marginRight: 6 }} />
                  {k.name} · <span className="nc-mono">{k.keyPrefix}...</span> ·{' '}
                  <span className="nc-pay-badge">
                    {k.environment === 'sandbox' ? 'SANDBOX' : 'PROD'}
                  </span>
                </strong>
                <span>
                  Permisos: {k.scopes.join(', ')} · {k.active ? 'Activa' : 'Revocada'}
                  {k.lastUsedAt ? ` · Último uso: ${new Date(k.lastUsedAt).toLocaleDateString('es-EC')}` : ''}
                </span>
              </div>
              {k.active && (
                <button
                  type="button"
                  className="nc-btn nc-btn-ghost nc-btn-sm"
                  onClick={() => handleRevoke(k.id)}
                >
                  <Trash2 size={14} />
                  <span>Revocar</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {!compact && (
        <div className="nc-reseller-sim" style={{ fontSize: '0.76rem' }}>
          <strong style={{ display: 'block', marginBottom: 6 }}>Uso rápido (API Pública v1):</strong>
          <code className="nc-mono" style={{ display: 'block', whiteSpace: 'pre-wrap', opacity: 0.9 }}>
            {`curl ${v1Base}/catalog -H "Authorization: Bearer TU_API_KEY"\ncurl -X POST ${v1Base}/orders -H "Authorization: Bearer TU_API_KEY" -H "Idempotency-Key: ord-001" -H "Content-Type: application/json" -d '{"packageId":"ff-310","playerId":"2491857302"}'`}
          </code>
        </div>
      )}
    </div>
  );
}
