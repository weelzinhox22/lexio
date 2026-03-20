'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    GraduationCap,
    Plus,
    Pencil,
    Trash2,
    Copy,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    Shield,
    Mail,
    Phone,
    Building2,
    BookOpen,
    UserCheck,
    UserX,
    Key,
    Loader2,
    Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type Intern = {
    id: string
    owner_id: string
    user_id: string | null
    name: string
    email: string
    phone: string | null
    oab_student: string | null
    university: string | null
    semester: string | null
    status: string
    permissions: Record<string, boolean>
    last_login_at: string | null
    created_at: string
    updated_at: string
}

// No credentials type needed - password is set by lawyer

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Permission definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PERMISSION_MODULES = [
    { key: 'dashboard', label: 'Painel Principal', description: 'Visão geral do sistema', icon: '📊', group: 'Gestão' },
    { key: 'processes', label: 'Processos', description: 'Visualizar e editar processos', icon: '📁', group: 'Gestão' },
    { key: 'kanban', label: 'Kanban', description: 'Quadro visual de processos', icon: '📋', group: 'Gestão' },
    { key: 'deadlines', label: 'Prazos', description: 'Controle de prazos judiciais', icon: '⏰', group: 'Gestão' },
    { key: 'calendar', label: 'Agenda', description: 'Compromissos e audiências', icon: '📅', group: 'Gestão' },
    { key: 'documents', label: 'Documentos', description: 'Upload e gestão de arquivos', icon: '📄', group: 'Arquivos' },
    { key: 'templates', label: 'Templates', description: 'Modelos de documentos', icon: '📝', group: 'Arquivos' },
    { key: 'ai_writer', label: 'Redator IA', description: 'Geração de textos jurídicos', icon: '✨', group: 'Inteligência' },
    { key: 'ai_analysis', label: 'Análise Jurimétrica', description: 'Análise com IA', icon: '🧠', group: 'Inteligência' },
    { key: 'laws', label: 'Consulta de Leis', description: 'Pesquisa de legislação', icon: '📚', group: 'Inteligência' },
    { key: 'tools', label: 'Ferramentas', description: 'Calculadoras e simuladores', icon: '🛠️', group: 'Ferramentas' },
    { key: 'timesheet', label: 'Timesheet', description: 'Registro de horas', icon: '🕐', group: 'Ferramentas' },
    { key: 'clients', label: 'Clientes', description: 'Gestão de clientes', icon: '👥', group: 'Comercial' },
    { key: 'leads', label: 'Leads (CRM)', description: 'Gestão de prospects', icon: '🎯', group: 'Comercial' },
    { key: 'financial', label: 'Financeiro', description: 'Honorários e despesas', icon: '💰', group: 'Administrativo' },
    { key: 'reports', label: 'Relatórios', description: 'Relatórios e métricas', icon: '📈', group: 'Administrativo' },
    { key: 'subscription', label: 'Assinatura', description: 'Gerenciar plano e pagamento', icon: '💳', group: 'Administrativo' },
    { key: 'settings', label: 'Configurações', description: 'Perfil e preferências', icon: '⚙️', group: 'Administrativo' },
]

const PERMISSION_GROUPS = ['Gestão', 'Arquivos', 'Inteligência', 'Ferramentas', 'Comercial', 'Administrativo']

const DEFAULT_PERMISSIONS: Record<string, boolean> = {
    dashboard: true,
    processes: true,
    kanban: true,
    deadlines: true,
    calendar: true,
    documents: true,
    templates: false,
    ai_writer: true,
    ai_analysis: true,
    laws: true,
    tools: true,
    timesheet: true,
    clients: false,
    leads: false,
    financial: false,
    reports: false,
    subscription: true,
    settings: true,
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Page Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function InternsPage() {
    const [interns, setInterns] = useState<Intern[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)

    // Form states
    const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        oab_student: '',
        university: '',
        semester: '',
    })
    const [formPassword, setFormPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [formPermissions, setFormPermissions] = useState<Record<string, boolean>>(DEFAULT_PERMISSIONS)
    const [saving, setSaving] = useState(false)

    // Fetch interns
    const fetchInterns = useCallback(async () => {
        try {
            const res = await fetch('/api/interns')
            const data = await res.json()
            if (res.ok) {
                setInterns(data.interns || [])
            }
        } catch (e) {
            console.error('[interns] fetch error:', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchInterns()
    }, [fetchInterns])

    // Filtered interns
    const filteredInterns = interns.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Create intern
    const handleCreate = async () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            toast.error('Nome e e-mail são obrigatórios.')
            return
        }
        if (!formPassword || formPassword.length < 6) {
            toast.error('A senha deve ter no mínimo 6 caracteres.')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/interns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    password: formPassword,
                    permissions: formPermissions,
                }),
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            setCreateDialogOpen(false)
            resetForm()
            fetchInterns()
            toast.success(`Estagiário ${formData.name} criado com sucesso! Repasse as credenciais ao estagiário.`)
        } catch (e: any) {
            toast.error(e.message || 'Erro ao criar estagiário.')
        } finally {
            setSaving(false)
        }
    }

    // Update intern
    const handleUpdate = async () => {
        if (!selectedIntern) return

        setSaving(true)
        try {
            const res = await fetch(`/api/interns/${selectedIntern.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    oab_student: formData.oab_student,
                    university: formData.university,
                    semester: formData.semester,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setEditDialogOpen(false)
            setSelectedIntern(null)
            fetchInterns()
            toast.success('Dados atualizados com sucesso!')
        } catch (e: any) {
            toast.error(e.message || 'Erro ao atualizar.')
        } finally {
            setSaving(false)
        }
    }

    // Update permissions
    const handleUpdatePermissions = async () => {
        if (!selectedIntern) return

        setSaving(true)
        try {
            const res = await fetch(`/api/interns/${selectedIntern.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions: formPermissions }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setPermissionsDialogOpen(false)
            setSelectedIntern(null)
            fetchInterns()
            toast.success('Permissões atualizadas!')
        } catch (e: any) {
            toast.error(e.message || 'Erro ao atualizar permissões.')
        } finally {
            setSaving(false)
        }
    }

    // Toggle status
    const handleToggleStatus = async (intern: Intern) => {
        const newStatus = intern.status === 'active' ? 'inactive' : 'active'
        try {
            const res = await fetch(`/api/interns/${intern.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            if (!res.ok) throw new Error()
            fetchInterns()
            toast.success(newStatus === 'active' ? 'Estagiário ativado!' : 'Estagiário desativado.')
        } catch {
            toast.error('Erro ao alterar status.')
        }
    }

    // Delete intern
    const handleDelete = async () => {
        if (!selectedIntern) return

        setSaving(true)
        try {
            const res = await fetch(`/api/interns/${selectedIntern.id}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setDeleteDialogOpen(false)
            setSelectedIntern(null)
            fetchInterns()
            toast.success('Estagiário excluído.')
        } catch (e: any) {
            toast.error(e.message || 'Erro ao excluir.')
        } finally {
            setSaving(false)
        }
    }

    // Change password
    const handleChangePassword = async () => {
        if (!selectedIntern) return
        if (!newPassword || newPassword.length < 6) {
            toast.error('A nova senha deve ter no mínimo 6 caracteres.')
            return
        }

        setSaving(true)
        try {
            const res = await fetch(`/api/interns/${selectedIntern.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setPasswordDialogOpen(false)
            setNewPassword('')
            setSelectedIntern(null)
            toast.success('Senha alterada com sucesso!')
        } catch (e: any) {
            toast.error(e.message || 'Erro ao alterar senha.')
        } finally {
            setSaving(false)
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({ name: '', email: '', phone: '', oab_student: '', university: '', semester: '' })
        setFormPassword('')
        setShowPassword(false)
        setFormPermissions({ ...DEFAULT_PERMISSIONS })
    }

    // Open edit dialog
    const openEdit = (intern: Intern) => {
        setSelectedIntern(intern)
        setFormData({
            name: intern.name,
            email: intern.email,
            phone: intern.phone || '',
            oab_student: intern.oab_student || '',
            university: intern.university || '',
            semester: intern.semester || '',
        })
        setEditDialogOpen(true)
    }

    // Open permissions dialog
    const openPermissions = (intern: Intern) => {
        setSelectedIntern(intern)
        setFormPermissions({ ...DEFAULT_PERMISSIONS, ...intern.permissions })
        setPermissionsDialogOpen(true)
    }

    // Count active permissions
    const countPermissions = (perms: Record<string, boolean>) =>
        Object.values(perms).filter(Boolean).length

    // Copy to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Copiado!')
    }

    // Toggle all permissions in a group
    const toggleGroup = (group: string, value: boolean) => {
        const groupKeys = PERMISSION_MODULES.filter(m => m.group === group).map(m => m.key)
        setFormPermissions(prev => {
            const updated = { ...prev }
            groupKeys.forEach(k => { updated[k] = value })
            return updated
        })
    }

    // ─── Loading State ────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6 md:space-y-8">
            {/* ── Header ──────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="rounded-xl bg-violet-100 p-2.5">
                            <GraduationCap className="h-7 w-7 text-violet-600" />
                        </div>
                        Estagiários
                    </h1>
                    <p className="text-slate-600 mt-1.5 text-sm md:text-base">
                        Gerencie contas e permissões dos seus estagiários
                    </p>
                </div>
                <Button
                    onClick={() => { resetForm(); setCreateDialogOpen(true) }}
                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl h-11 px-5"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Estagiário
                </Button>
            </div>

            {/* ── Search Bar ──────────────────────── */}
            {interns.length > 0 && (
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nome ou e-mail..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 rounded-xl border-slate-200"
                    />
                </div>
            )}

            {/* ── Stats ────────────────────────────── */}
            {interns.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-violet-50 p-2">
                                <GraduationCap className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{interns.length}</p>
                                <p className="text-xs text-slate-500">Total</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-green-50 p-2">
                                <UserCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {interns.filter(i => i.status === 'active').length}
                                </p>
                                <p className="text-xs text-slate-500">Ativos</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-amber-50 p-2">
                                <UserX className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {interns.filter(i => i.status === 'inactive').length}
                                </p>
                                <p className="text-xs text-slate-500">Inativos</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {PERMISSION_MODULES.length}
                                </p>
                                <p className="text-xs text-slate-500">Módulos</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── Intern List ──────────────────────── */}
            {filteredInterns.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-2xl bg-violet-50 p-5 mb-4">
                            <GraduationCap className="h-10 w-10 text-violet-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum estagiário cadastrado'}
                        </h3>
                        <p className="text-sm text-slate-500 max-w-sm mb-6">
                            {searchQuery
                                ? 'Tente buscar com outros termos.'
                                : 'Adicione seu primeiro estagiário para gerenciar acessos e permissões.'}
                        </p>
                        {!searchQuery && (
                            <Button
                                onClick={() => { resetForm(); setCreateDialogOpen(true) }}
                                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Estagiário
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredInterns.map((intern) => (
                        <Card
                            key={intern.id}
                            className={cn(
                                "border-slate-200/60 shadow-sm hover:shadow-md transition-all",
                                intern.status !== 'active' && "opacity-60"
                            )}
                        >
                            <CardContent className="p-5">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Avatar + Info */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0",
                                            intern.status === 'active'
                                                ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                                                : "bg-slate-200 text-slate-400"
                                        )}>
                                            {intern.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-slate-900 truncate">{intern.name}</h3>
                                                <Badge
                                                    variant={intern.status === 'active' ? 'default' : 'secondary'}
                                                    className={cn(
                                                        "text-[10px] font-bold uppercase tracking-wide",
                                                        intern.status === 'active'
                                                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                            : "bg-slate-100 text-slate-500"
                                                    )}
                                                >
                                                    {intern.status === 'active' ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {intern.email}
                                                </span>
                                                {intern.university && (
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" /> {intern.university}
                                                    </span>
                                                )}
                                                {intern.semester && (
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="h-3 w-3" /> {intern.semester}º semestre
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <Shield className="h-3 w-3 text-violet-500" />
                                                <span className="text-[11px] font-medium text-violet-600">
                                                    {countPermissions(intern.permissions)} de {PERMISSION_MODULES.length} módulos
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openPermissions(intern)}
                                            className="border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg text-xs h-8"
                                        >
                                            <Shield className="h-3.5 w-3.5 mr-1.5" />
                                            Permissões
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEdit(intern)}
                                            className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs h-8"
                                        >
                                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setSelectedIntern(intern); setNewPassword(''); setShowPassword(false); setPasswordDialogOpen(true) }}
                                            className="border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg text-xs h-8"
                                        >
                                            <Key className="h-3.5 w-3.5 mr-1.5" />
                                            Senha
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleStatus(intern)}
                                            className={cn(
                                                "rounded-lg text-xs h-8",
                                                intern.status === 'active'
                                                    ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                                    : "border-green-200 text-green-600 hover:bg-green-50"
                                            )}
                                        >
                                            {intern.status === 'active' ? (
                                                <><EyeOff className="h-3.5 w-3.5 mr-1.5" />Desativar</>
                                            ) : (
                                                <><Eye className="h-3.5 w-3.5 mr-1.5" />Ativar</>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setSelectedIntern(intern); setDeleteDialogOpen(true) }}
                                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs h-8"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* CREATE DIALOG                        */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <GraduationCap className="h-5 w-5 text-violet-600" />
                            Novo Estagiário
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados e defina a senha de acesso. O estagiário usará o e-mail e senha para fazer login.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="intern-name" className="text-sm font-medium">Nome completo *</Label>
                                <Input
                                    id="intern-name"
                                    placeholder="Maria Silva"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="intern-email" className="text-sm font-medium">E-mail *</Label>
                                <Input
                                    id="intern-email"
                                    type="email"
                                    placeholder="maria@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                    className="h-10"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="intern-password" className="text-sm font-medium">Senha de acesso *</Label>
                            <div className="relative">
                                <Input
                                    id="intern-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mínimo 6 caracteres"
                                    value={formPassword}
                                    onChange={(e) => setFormPassword(e.target.value)}
                                    className="h-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400">Você poderá alterar essa senha a qualquer momento.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="intern-phone" className="text-sm font-medium">Telefone</Label>
                                <Input
                                    id="intern-phone"
                                    placeholder="(71) 99999-0000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="intern-oab" className="text-sm font-medium">OAB Estudantil</Label>
                                <Input
                                    id="intern-oab"
                                    placeholder="12345-E/BA"
                                    value={formData.oab_student}
                                    onChange={(e) => setFormData(p => ({ ...p, oab_student: e.target.value }))}
                                    className="h-10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="intern-uni" className="text-sm font-medium">Universidade</Label>
                                <Input
                                    id="intern-uni"
                                    placeholder="UFBA, UNEB, etc."
                                    value={formData.university}
                                    onChange={(e) => setFormData(p => ({ ...p, university: e.target.value }))}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="intern-sem" className="text-sm font-medium">Semestre</Label>
                                <Input
                                    id="intern-sem"
                                    placeholder="8"
                                    value={formData.semester}
                                    onChange={(e) => setFormData(p => ({ ...p, semester: e.target.value }))}
                                    className="h-10"
                                />
                            </div>
                        </div>

                        {/* Permissions Section in Create */}
                        <div className="border-t border-slate-200 pt-4 mt-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-violet-500" />
                                    Permissões Iniciais
                                </h4>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormPermissions(Object.fromEntries(PERMISSION_MODULES.map(m => [m.key, true])))}
                                        className="text-[10px] font-bold text-violet-600 hover:text-violet-700 uppercase tracking-wide"
                                    >
                                        Marcar Todos
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormPermissions(Object.fromEntries(PERMISSION_MODULES.map(m => [m.key, false])))}
                                        className="text-[10px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wide"
                                    >
                                        Desmarcar Todos
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {PERMISSION_MODULES.map((mod) => (
                                    <label
                                        key={mod.key}
                                        className={cn(
                                            "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all",
                                            formPermissions[mod.key]
                                                ? "border-violet-200 bg-violet-50/50"
                                                : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                                        )}
                                    >
                                        <Switch
                                            checked={formPermissions[mod.key]}
                                            onCheckedChange={(checked) =>
                                                setFormPermissions(p => ({ ...p, [mod.key]: checked }))
                                            }
                                            className="data-[state=checked]:bg-violet-600"
                                        />
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-sm">{mod.icon}</span>
                                            <span className="text-xs font-medium text-slate-700 truncate">{mod.label}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="rounded-lg">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={saving}
                            className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
                        >
                            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Criando...</> : 'Criar Estagiário'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* PASSWORD CHANGE DIALOG              */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Key className="h-5 w-5 text-violet-600" />
                            Alterar Senha — {selectedIntern?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Defina uma nova senha de acesso para o estagiário. Ele poderá fazer login imediatamente com a nova senha.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="new-password" className="text-sm font-medium">Nova senha *</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mínimo 6 caracteres"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="h-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400">A senha anterior será substituída imediatamente.</p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => { setPasswordDialogOpen(false); setNewPassword(''); setShowPassword(false) }} className="rounded-lg">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleChangePassword}
                            disabled={saving || !newPassword || newPassword.length < 6}
                            className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
                        >
                            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Alterando...</> : 'Alterar Senha'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* EDIT DIALOG                          */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-slate-600" />
                            Editar Estagiário
                        </DialogTitle>
                        <DialogDescription>Atualize os dados cadastrais do estagiário.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Nome completo</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">E-mail</Label>
                                <Input value={formData.email} disabled className="h-10 bg-slate-50 cursor-not-allowed" />
                                <p className="text-[10px] text-slate-400">O e-mail não pode ser alterado.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Telefone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">OAB Estudantil</Label>
                                <Input
                                    value={formData.oab_student}
                                    onChange={(e) => setFormData(p => ({ ...p, oab_student: e.target.value }))}
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Universidade</Label>
                                <Input
                                    value={formData.university}
                                    onChange={(e) => setFormData(p => ({ ...p, university: e.target.value }))}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Semestre</Label>
                                <Input
                                    value={formData.semester}
                                    onChange={(e) => setFormData(p => ({ ...p, semester: e.target.value }))}
                                    className="h-10"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-lg">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={saving}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
                        >
                            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* PERMISSIONS DIALOG                   */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-5 w-5 text-violet-600" />
                            Permissões — {selectedIntern?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Defina quais módulos da plataforma o estagiário poderá acessar.
                            <span className="ml-2 font-semibold text-violet-600">
                                {countPermissions(formPermissions)}/{PERMISSION_MODULES.length} ativos
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Quick actions */}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setFormPermissions(Object.fromEntries(PERMISSION_MODULES.map(m => [m.key, true])))}
                                className="text-[11px] font-bold text-violet-600 hover:text-violet-700 uppercase tracking-wide px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors"
                            >
                                ✅ Liberar Tudo
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormPermissions(Object.fromEntries(PERMISSION_MODULES.map(m => [m.key, false])))}
                                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wide px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                🚫 Restringir Tudo
                            </button>
                        </div>

                        {/* Grouped permissions */}
                        {PERMISSION_GROUPS.map((group) => {
                            const groupModules = PERMISSION_MODULES.filter(m => m.group === group)
                            const allChecked = groupModules.every(m => formPermissions[m.key])
                            const noneChecked = groupModules.every(m => !formPermissions[m.key])

                            return (
                                <div key={group} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{group}</h4>
                                        <button
                                            type="button"
                                            onClick={() => toggleGroup(group, !allChecked)}
                                            className="text-[10px] font-bold text-violet-500 hover:text-violet-700 uppercase tracking-wide"
                                        >
                                            {allChecked ? 'Desmarcar grupo' : 'Marcar grupo'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {groupModules.map((mod) => (
                                            <label
                                                key={mod.key}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                    formPermissions[mod.key]
                                                        ? "border-violet-200 bg-violet-50/60 shadow-sm"
                                                        : "border-slate-100 hover:bg-slate-50"
                                                )}
                                            >
                                                <Switch
                                                    checked={formPermissions[mod.key]}
                                                    onCheckedChange={(checked) =>
                                                        setFormPermissions(p => ({ ...p, [mod.key]: checked }))
                                                    }
                                                    className="data-[state=checked]:bg-violet-600"
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span>{mod.icon}</span>
                                                        <span className="text-sm font-medium text-slate-800">{mod.label}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">{mod.description}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)} className="rounded-lg">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpdatePermissions}
                            disabled={saving}
                            className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
                        >
                            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : 'Salvar Permissões'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* DELETE CONFIRM                       */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-600" />
                            Excluir Estagiário
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir <strong>{selectedIntern?.name}</strong>?
                            Esta ação irá remover a conta completamente da plataforma e não poderá ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                            {saving ? 'Excluindo...' : 'Sim, excluir'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
