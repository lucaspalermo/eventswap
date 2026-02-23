'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  Activity,
  Calendar,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiKey {
  id: number;
  key_name: string;
  api_key: string;
  permissions: string[];
  rate_limit: number;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  usage: {
    total_requests: number;
    last_7d_requests: number;
  };
}

interface NewKeyResponse {
  id: number;
  key_name: string;
  api_key: string;
  api_secret: string;
  permissions: string[];
  rate_limit: number;
  is_active: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create key state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // New key created state
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyData, setNewKeyData] = useState<NewKeyResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Revoke state
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Fetch keys
  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/api-keys');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar chaves');
      setKeys(json.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar chaves de API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // Create key
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setIsCreating(true);
    setError('');

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_name: newKeyName.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao criar chave');

      setNewKeyData(json.data);
      setShowCreateDialog(false);
      setShowNewKeyDialog(true);
      setNewKeyName('');
      fetchKeys();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar chave de API');
    } finally {
      setIsCreating(false);
    }
  };

  // Revoke key
  const handleRevokeKey = async () => {
    if (!revokeTarget) return;
    setIsRevoking(true);

    try {
      const res = await fetch(`/api/api-keys?id=${revokeTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao revogar chave');

      setShowRevokeDialog(false);
      setRevokeTarget(null);
      fetchKeys();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao revogar chave de API');
    } finally {
      setIsRevoking(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: 'key' | 'secret') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'key') {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      } else {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Mask API key for display
  const maskKey = (key: string) => {
    if (key.length < 16) return key;
    return key.slice(0, 12) + '...' + key.slice(-4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[#6C3CE1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-4 py-3 rounded-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-950 dark:text-white">
            Chaves de API
          </h3>
          <p className="text-sm text-neutral-500 mt-0.5">
            Gerencie suas chaves de acesso para a API publica do EventSwap
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Gerar Nova Chave
        </Button>
      </div>

      {/* Keys List */}
      {keys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Key className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Nenhuma chave de API
            </h4>
            <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
              Crie uma chave de API para integrar seu sistema com o EventSwap.
              Parceiros como cerimonialistas e espacos de eventos podem acessar
              listagens, categorias e estatisticas da plataforma.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Chave
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="h-4 w-4 text-[#6C3CE1]" />
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {key.key_name}
                      </span>
                      <Badge variant={key.is_active ? 'success' : 'destructive'}>
                        {key.is_active ? 'Ativa' : 'Revogada'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded font-mono text-neutral-600 dark:text-neutral-400">
                        {maskKey(key.api_key)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.api_key, 'key')}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                        title="Copiar chave"
                      >
                        <Copy className="h-3.5 w-3.5 text-neutral-400" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Criada em {formatDate(key.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5" />
                        Ultimo uso: {formatDate(key.last_used_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" />
                        {key.permissions?.join(', ') || 'read'}
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-neutral-400">
                        Total: <span className="font-medium text-neutral-600 dark:text-neutral-300">{key.usage.total_requests.toLocaleString('pt-BR')}</span> requisicoes
                      </span>
                      <span className="text-neutral-400">
                        Ultimos 7 dias: <span className="font-medium text-neutral-600 dark:text-neutral-300">{key.usage.last_7d_requests.toLocaleString('pt-BR')}</span>
                      </span>
                    </div>
                  </div>

                  {key.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800"
                      onClick={() => {
                        setRevokeTarget(key);
                        setShowRevokeDialog(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Revogar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-[#6C3CE1]/5 border-[#6C3CE1]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#6C3CE1]">
            Sobre a API do EventSwap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <p>
            A API publica permite que parceiros integrem dados do EventSwap em seus
            sistemas. Ideal para cerimonialistas, espacos de eventos e plataformas parceiras.
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Limite de 100 requisicoes por minuto por chave</li>
            <li>Maximo de 5 chaves ativas por conta</li>
            <li>Acesso somente leitura (listings, categorias, estatisticas)</li>
          </ul>
          <a
            href="/api-docs"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-[#6C3CE1] hover:underline mt-2 text-xs font-medium"
          >
            Ver documentacao completa
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Nova Chave de API</DialogTitle>
            <DialogDescription>
              Crie uma nova chave para integrar seu sistema com a API do EventSwap.
              A chave tera permissao de leitura com limite de 100 requisicoes/minuto.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              label="Nome da Chave"
              placeholder="Ex: Meu Site, Sistema de Reservas, CRM..."
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Um nome descritivo para identificar onde esta chave sera utilizada.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewKeyName('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateKey}
              disabled={!newKeyName.trim() || isCreating}
              className="gap-2"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              {isCreating ? 'Gerando...' : 'Gerar Chave'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Key Created Dialog */}
      <Dialog
        open={showNewKeyDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowNewKeyDialog(false);
            setNewKeyData(null);
            setCopiedKey(false);
            setCopiedSecret(false);
            setShowSecret(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-500" />
              Chave Criada com Sucesso
            </DialogTitle>
            <DialogDescription>
              Salve o segredo abaixo agora. Por seguranca, ele nao sera exibido novamente.
            </DialogDescription>
          </DialogHeader>

          {newKeyData && (
            <div className="space-y-4 py-2">
              {/* API Key */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  API Key
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-lg font-mono text-neutral-700 dark:text-neutral-300 break-all">
                    {newKeyData.api_key}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newKeyData.api_key, 'key')}
                    className="flex-shrink-0"
                  >
                    {copiedKey ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* API Secret */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  API Secret
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 rounded-lg font-mono text-amber-800 dark:text-amber-300 break-all">
                    {showSecret ? newKeyData.api_secret : '*'.repeat(48)}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecret(!showSecret)}
                    className="flex-shrink-0"
                  >
                    {showSecret ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newKeyData.api_secret, 'secret')}
                    className="flex-shrink-0"
                  >
                    {copiedSecret ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Importante</p>
                  <p className="mt-0.5">
                    O segredo da API nao sera exibido novamente. Salve-o em um local seguro.
                    Caso perca o segredo, sera necessario gerar uma nova chave.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setShowNewKeyDialog(false);
                setNewKeyData(null);
              }}
            >
              Entendido, Ja Salvei
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Key Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Revogar Chave de API
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja revogar a chave{' '}
              <strong>{revokeTarget?.key_name}</strong>? Essa acao e irreversivel
              e todas as integracoes que usam esta chave pararao de funcionar imediatamente.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRevokeDialog(false);
                setRevokeTarget(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeKey}
              disabled={isRevoking}
              className="gap-2"
            >
              {isRevoking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isRevoking ? 'Revogando...' : 'Sim, Revogar Chave'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
