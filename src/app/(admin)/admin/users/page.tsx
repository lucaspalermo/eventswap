'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { RatingStars } from '@/components/shared/rating-stars';
import { adminService } from '@/services/admin.service';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

interface UserRow {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUBMITTED';
  listings: number;
  rating: number;
  createdAt: string;
}

const mockUsers: UserRow[] = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    avatar: 'MS',
    role: 'USER',
    kycStatus: 'APPROVED',
    listings: 12,
    rating: 4.8,
    createdAt: '2025-08-15',
  },
  {
    id: '2',
    name: 'Joao Santos',
    email: 'joao.santos@email.com',
    avatar: 'JS',
    role: 'ADMIN',
    kycStatus: 'APPROVED',
    listings: 0,
    rating: 5.0,
    createdAt: '2025-06-01',
  },
  {
    id: '3',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@email.com',
    avatar: 'AO',
    role: 'USER',
    kycStatus: 'PENDING',
    listings: 3,
    rating: 4.2,
    createdAt: '2025-11-20',
  },
  {
    id: '4',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@email.com',
    avatar: 'CM',
    role: 'USER',
    kycStatus: 'REJECTED',
    listings: 0,
    rating: 0,
    createdAt: '2026-01-10',
  },
  {
    id: '5',
    name: 'Fernanda Costa',
    email: 'fernanda.costa@email.com',
    avatar: 'FC',
    role: 'USER',
    kycStatus: 'APPROVED',
    listings: 8,
    rating: 4.6,
    createdAt: '2025-09-05',
  },
  {
    id: '6',
    name: 'Ricardo Almeida',
    email: 'ricardo.almeida@email.com',
    avatar: 'RA',
    role: 'USER',
    kycStatus: 'APPROVED',
    listings: 15,
    rating: 4.9,
    createdAt: '2025-07-22',
  },
  {
    id: '7',
    name: 'Luciana Ferreira',
    email: 'luciana.ferreira@email.com',
    avatar: 'LF',
    role: 'USER',
    kycStatus: 'PENDING',
    listings: 1,
    rating: 3.5,
    createdAt: '2026-02-01',
  },
  {
    id: '8',
    name: 'Pedro Barbosa',
    email: 'pedro.barbosa@email.com',
    avatar: 'PB',
    role: 'ADMIN',
    kycStatus: 'APPROVED',
    listings: 2,
    rating: 4.7,
    createdAt: '2025-05-10',
  },
];

const roleBadge: Record<string, { label: string; variant: 'secondary' | 'default' }> = {
  USER: { label: 'Usuario', variant: 'secondary' as const },
  ADMIN: { label: 'Admin', variant: 'default' as const },
  SUPER_ADMIN: { label: 'Super Admin', variant: 'default' as const },
};

const kycBadge: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' | 'secondary' }> = {
  PENDING: { label: 'Pendente', variant: 'warning' as const },
  SUBMITTED: { label: 'Enviado', variant: 'secondary' as const },
  APPROVED: { label: 'Aprovado', variant: 'success' as const },
  REJECTED: { label: 'Rejeitado', variant: 'destructive' as const },
};

const ITEMS_PER_PAGE = 20;

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [users, setUsers] = useState<UserRow[]>(mockUsers);
  const [totalCount, setTotalCount] = useState(2847);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getUsers({
        search: search || undefined,
        role: roleFilter,
        kycStatus: kycFilter,
        page,
        limit: ITEMS_PER_PAGE,
      });

      if (result?.data) {
        const mapped: UserRow[] = result.data.map((u: Record<string, unknown>) => ({
          id: String(u.id),
          name: (u.name as string) || 'Sem nome',
          email: (u.email as string) || '',
          avatar: ((u.name as string) || 'U')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
          role: (u.role as UserRow['role']) || 'USER',
          kycStatus: (u.kyc_status as UserRow['kycStatus']) || 'PENDING',
          listings: 0,
          rating: Number(u.rating_avg) || 0,
          createdAt: u.created_at as string,
        }));

        setUsers(mapped);
        setTotalCount(result.count || mapped.length);
        setIsRealData(true);
      }
    } catch {
      // Keep mock data on error (demo mode)
      if (!isRealData) {
        // Apply client-side filtering to mock data
        const filtered = mockUsers.filter((user) => {
          const matchesSearch =
            !search ||
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
          const matchesRole = roleFilter === 'all' || user.role === roleFilter;
          const matchesKyc = kycFilter === 'all' || user.kycStatus === kycFilter;
          return matchesSearch && matchesRole && matchesKyc;
        });
        setUsers(filtered);
        setTotalCount(filtered.length);
      }
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, kycFilter, page, isRealData]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [loadUsers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, kycFilter]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Gerenciar Usuarios
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Visualize, edite e gerencie todos os usuarios da plataforma.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  iconLeft={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="flex items-center gap-3">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os papeis</SelectItem>
                    <SelectItem value="USER">Usuario</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={kycFilter} onValueChange={setKycFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status KYC" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="APPROVED">Aprovado</SelectItem>
                    <SelectItem value="REJECTED">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Papel
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      KYC
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Anuncios
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Avaliacao
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Criado em
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4" colSpan={8}>
                          <div className="flex items-center gap-4">
                            <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-1/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                              <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td className="px-6 py-12 text-center text-sm text-zinc-500" colSpan={8}>
                        Nenhum usuario encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1]/10 text-xs font-bold text-[#6C3CE1]">
                              {user.avatar}
                            </div>
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-zinc-600 dark:text-zinc-300">
                            {user.email}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={roleBadge[user.role]?.variant || 'secondary'}>
                            {roleBadge[user.role]?.label || user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={kycBadge[user.kycStatus]?.variant || 'secondary'}>
                            {kycBadge[user.kycStatus]?.label || user.kycStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-zinc-600 dark:text-zinc-300">
                            {user.listings}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.rating > 0 ? (
                            <RatingStars rating={user.rating} size="sm" showValue />
                          ) : (
                            <span className="text-xs text-zinc-400">Sem avaliacao</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Acoes</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/users/${user.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Perfil
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-amber-600 focus:text-amber-700">
                                <Ban className="mr-2 h-4 w-4" />
                                Suspender
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-700">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Mostrando {((page - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(page * ITEMS_PER_PAGE, totalCount)} de {totalCount.toLocaleString('pt-BR')} usuarios
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant="outline"
                    size="sm"
                    className={page === p ? 'bg-[#6C3CE1] text-white hover:bg-[#5B32C1] border-[#6C3CE1]' : ''}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                {totalPages > 3 && (
                  <>
                    <span className="text-sm text-zinc-400">...</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(totalPages)}>
                      {totalPages}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Proximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
