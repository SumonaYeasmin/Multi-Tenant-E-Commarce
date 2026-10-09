'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, ShieldCheck, Check, Plus, CheckSquare, Square, Eye } from 'lucide-react';
import {
  staff as seedStaff,
  roles as seedRoles,
  rolePermissions,
  permissionModules,
  permissionActions,
} from '@/data/admin';
import { useAdmin } from '@/contexts/AdminContext';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { PermissionAction, AdminModule } from '@/types/commerce';

type Matrix = Record<string, PermissionAction[]>;

const presetRolePermissions: Record<string, Partial<Record<AdminModule, PermissionAction[]>>> = {
  Owner: Object.fromEntries(permissionModules.map((m) => [m.key, [...permissionActions]])),
  'Store Manager': rolePermissions.manager,
  'Fulfillment Staff': rolePermissions.fulfillment,
  'Customer Care': {
    dashboard: ['view'],
    orders: ['view', 'update'],
    returns: ['view', 'update'],
    customers: ['view', 'update'],
    reviews: ['view', 'update', 'delete'],
  },
  'Content Editor': {
    dashboard: ['view'],
    products: ['view', 'create', 'update'],
    categories: ['view', 'create', 'update'],
    collections: ['view', 'create', 'update'],
    brands: ['view', 'create', 'update'],
    theme: ['view', 'update'],
    content: ['view', 'create', 'update', 'delete'],
    media: ['view', 'create', 'update', 'delete'],
  },
};

function buildInitialMatrix(roleName: string): Matrix {
  if (roleName === 'Owner') {
    return Object.fromEntries(permissionModules.map((m) => [m.key, [...permissionActions]]));
  }
  const preset = presetRolePermissions[roleName] ?? {};
  return Object.fromEntries(
    permissionModules.map((m) => [
      m.key,
      [...(preset[m.key as AdminModule] ?? [])],
    ])
  );
}

function createEmptyMatrix(): Matrix {
  return Object.fromEntries(permissionModules.map((m) => [m.key, []]));
}

export default function AdminStaffPage() {
  const { can } = useAdmin();
  const [tab, setTab] = useState<'members' | 'roles'>('members');
  const [members, setMembers] = useState(seedStaff);
  const [roleList, setRoleList] = useState(seedRoles);
  const [invite, setInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Store Manager');

  // Active role & matrix state
  const [activeRole, setActiveRole] = useState('Store Manager');
  const [roleMatrices, setRoleMatrices] = useState<Record<string, Matrix>>(() => {
    const initial: Record<string, Matrix> = {};
    seedRoles.forEach((r) => {
      initial[r.name] = buildInitialMatrix(r.name);
    });
    return initial;
  });

  // Drawer state for creating new staff role
  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleMatrix, setNewRoleMatrix] = useState<Matrix>(() => createEmptyMatrix());

  const locked = activeRole === 'Owner' || !can('staff', 'update');
  const currentMatrix = roleMatrices[activeRole] ?? createEmptyMatrix();

  const handleOpenNewRoleDrawer = () => {
    setNewRoleName('');
    setNewRoleDesc('');
    // Default with View permission on dashboard
    const defaultNewMatrix = createEmptyMatrix();
    defaultNewMatrix['dashboard'] = ['view'];
    setNewRoleMatrix(defaultNewMatrix);
    setIsNewRoleOpen(true);
  };

  const handleCreateRole = () => {
    const trimmed = newRoleName.trim();
    if (!trimmed) {
      toast.error('Please enter a role name');
      return;
    }
    if (roleList.some((r) => r.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('A role with this name already exists');
      return;
    }

    const createdRole = {
      id: `r_${Date.now()}`,
      name: trimmed,
      members: 0,
      system: false,
      description: newRoleDesc.trim() || 'Custom staff role.',
    };

    setRoleList((prev) => [...prev, createdRole]);
    setRoleMatrices((prev) => ({
      ...prev,
      [trimmed]: newRoleMatrix,
    }));
    setActiveRole(trimmed);
    setIsNewRoleOpen(false);
    toast.success(`Role "${trimmed}" created successfully`);
  };

  const toggleActivePermission = (moduleKey: string, action: PermissionAction) => {
    if (locked) return;
    setRoleMatrices((prev) => {
      const matrixForRole = prev[activeRole] ?? createEmptyMatrix();
      const currentActions = matrixForRole[moduleKey] ?? [];
      const updatedActions = currentActions.includes(action)
        ? currentActions.filter((a) => a !== action)
        : [...currentActions, action];

      return {
        ...prev,
        [activeRole]: {
          ...matrixForRole,
          [moduleKey]: updatedActions,
        },
      };
    });
  };

  const toggleNewRolePermission = (moduleKey: string, action: PermissionAction) => {
    setNewRoleMatrix((prev) => {
      const currentActions = prev[moduleKey] ?? [];
      const updatedActions = currentActions.includes(action)
        ? currentActions.filter((a) => a !== action)
        : [...currentActions, action];
      return {
        ...prev,
        [moduleKey]: updatedActions,
      };
    });
  };

  const toggleNewRoleRowAll = (moduleKey: string) => {
    setNewRoleMatrix((prev) => {
      const current = prev[moduleKey] ?? [];
      const allSelected = permissionActions.every((a) => current.includes(a));
      return {
        ...prev,
        [moduleKey]: allSelected ? [] : [...permissionActions],
      };
    });
  };

  const selectAllNewRolePermissions = () => {
    setNewRoleMatrix(
      Object.fromEntries(permissionModules.map((m) => [m.key, [...permissionActions]]))
    );
  };

  const clearAllNewRolePermissions = () => {
    setNewRoleMatrix(createEmptyMatrix());
  };

  const setViewOnlyNewRolePermissions = () => {
    setNewRoleMatrix(
      Object.fromEntries(permissionModules.map((m) => [m.key, ['view']]))
    );
  };

  return (
    <ModuleGate module="staff">
      <div className="w-full space-y-6">
        <PageHeader
          title="Staff & roles"
          description={`${members.length} of 10 staff seats used on your plan.`}
          actions={
            <GuardedButton
              module="staff"
              action="create"
              size="sm"
              onClick={() => setInvite(true)}
            >
              <UserPlus className="h-4 w-4" aria-hidden /> Invite staff
            </GuardedButton>
          }
        />
        <div className="mb-6">
          <Tabs
            value={tab}
            onChange={(val) => setTab(val as typeof tab)}
            tabs={[
              { value: 'members', label: 'Members' },
              { value: 'roles', label: 'Roles & permissions' },
            ]}
          />
        </div>

        {/* 1. Members Tab with serial-wise aligned columns in table */}
        {tab === 'members' && (
          <Panel flush>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas/60 text-xs font-medium text-ink-muted">
                    <th scope="col" className="px-5 py-3">Member</th>
                    <th scope="col" className="px-5 py-3 w-48">Role</th>
                    <th scope="col" className="px-5 py-3 w-36">2FA</th>
                    <th scope="col" className="px-5 py-3 w-36">Status</th>
                    <th scope="col" className="px-5 py-3 w-36 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {members.map((s) => (
                    <tr key={s.id} className="hover:bg-subtle/30 transition-colors">
                      {/* Column 1: Member Info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-semibold text-ink">
                            {s.status === 'invited'
                              ? '@'
                              : s.name
                                  .split(' ')
                                  .map((x) => x[0])
                                  .join('')}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{s.name}</p>
                            <p className="text-xs text-ink-muted truncate">
                              {s.email}
                              {s.lastActive && ` · active ${timeAgo(s.lastActive)}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Role */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-ink-soft">
                        {s.role}
                      </td>

                      {/* Column 3: 2FA */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {s.twoFactor ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> 2FA
                          </span>
                        ) : (
                          <span className="text-xs text-ink-muted">No 2FA</span>
                        )}
                      </td>

                      {/* Column 4: Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Badge
                          tone={
                            s.status === 'active'
                              ? 'success'
                              : s.status === 'invited'
                              ? 'info'
                              : 'neutral'
                          }
                          dot
                        >
                          {s.status}
                        </Badge>
                      </td>

                      {/* Column 5: Action */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        {s.role !== 'Owner' ? (
                          <GuardedButton
                            module="staff"
                            action="update"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setMembers((m) =>
                                m.map((x) =>
                                  x.id === s.id
                                    ? {
                                        ...x,
                                        status:
                                          x.status === 'active'
                                            ? 'deactivated'
                                            : 'active',
                                      }
                                    : x
                                )
                              );
                              toast.success(
                                s.status === 'invited'
                                  ? 'Invitation resent'
                                  : s.status === 'active'
                                  ? `${s.name} deactivated — sessions revoked`
                                  : `${s.name} reactivated`
                              );
                            }}
                          >
                            {s.status === 'invited'
                              ? 'Resend'
                              : s.status === 'active'
                              ? 'Deactivate'
                              : 'Reactivate'}
                          </GuardedButton>
                        ) : (
                          <span className="inline-block px-3 text-xs text-ink-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* 2. Roles & Permissions Tab */}
        {tab === 'roles' && (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Left side: Roles List */}
            <Panel
              title="Roles"
              flush
              actions={
                <GuardedButton
                  module="staff"
                  action="create"
                  size="sm"
                  variant="ghost"
                  onClick={handleOpenNewRoleDrawer}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> New
                </GuardedButton>
              }
            >
              <ul className="py-1 divide-y divide-line/40">
                {roleList.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setActiveRole(r.name)}
                      aria-current={activeRole === r.name}
                      className={cn(
                        'w-full px-5 py-2.5 text-left cursor-pointer transition-colors',
                        activeRole === r.name ? 'bg-canvas' : 'hover:bg-canvas'
                      )}
                    >
                      <p className="text-sm font-medium text-ink flex items-center justify-between">
                        <span>{r.name}</span>
                        <span className="font-normal text-xs text-ink-muted">
                          · {r.members}
                        </span>
                      </p>
                      <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">{r.description}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Right side: Active Role Permissions Table */}
            <Panel
              title={`${activeRole} permissions`}
              description={
                activeRole === 'Owner'
                  ? 'The owner always has full access.'
                  : 'Changes apply immediately and are recorded in the audit log.'
              }
              flush
              actions={
                !locked && (
                  <Button
                    size="sm"
                    onClick={() => toast.success(`Permissions saved for ${activeRole}`)}
                  >
                    Save
                  </Button>
                )
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-line bg-canvas/40 text-xs font-medium text-ink-muted">
                      <th scope="col" className="px-5 py-2.5 text-left font-medium">Module</th>
                      {permissionActions.map((a) => (
                        <th
                          key={a}
                          scope="col"
                          className="px-3 py-2.5 font-medium capitalize text-center w-24"
                        >
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {permissionModules.map((m) => (
                      <tr key={m.key} className="hover:bg-subtle/30 transition-colors">
                        <td className="px-5 py-2.5 font-medium text-ink">
                          {m.label}
                        </td>
                        {permissionActions.map((a) => {
                          const on = !!currentMatrix[m.key]?.includes(a);
                          return (
                            <td key={a} className="px-3 py-2.5 text-center">
                              <button
                                type="button"
                                disabled={locked}
                                aria-pressed={on}
                                aria-label={`${m.label} ${a}`}
                                onClick={() => toggleActivePermission(m.key, a)}
                                className={cn(
                                  'inline-flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer',
                                  on
                                    ? 'border-ink bg-ink text-canvas'
                                    : 'border-line-strong hover:border-ink',
                                  locked && 'opacity-60 cursor-not-allowed'
                                )}
                              >
                                {on && <Check className="h-3 w-3 stroke-[3]" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {/* Right-Side Drawer: Create New Staff Role */}
        <Drawer
          open={isNewRoleOpen}
          onClose={() => setIsNewRoleOpen(false)}
          title="Create Staff Role"
          subtitle="Define a custom role and configure module-level access permissions."
          side="right"
          width="max-w-2xl"
          footer={
            <div className="flex items-center justify-between gap-3 w-full">
              <Button
                variant="ghost"
                onClick={() => setIsNewRoleOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRole}
                disabled={!newRoleName.trim()}
              >
                Create role
              </Button>
            </div>
          }
        >
          <div className="space-y-6 p-5">
            {/* Role Details */}
            <div className="space-y-4 rounded-lg border border-line bg-canvas/40 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Role Details
              </h3>
              <div className="space-y-3">
                <Input
                  label="Role Name"
                  placeholder="e.g. Operations Lead, Marketing Manager"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                />
                <Input
                  label="Description"
                  placeholder="Brief summary of duties and permissions"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                />
              </div>
            </div>

            {/* Role Permissions Matrix */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Module Permissions</h3>
                  <p className="text-xs text-ink-muted">
                    Select actions allowed for each navigation page.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={selectAllNewRolePermissions}
                  >
                    Select all
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={setViewOnlyNewRolePermissions}
                  >
                    View only
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={clearAllNewRolePermissions}
                  >
                    Clear all
                  </Button>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="rounded-lg border border-line overflow-hidden bg-surface">
                <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                  <table className="w-full min-w-[540px] text-sm">
                    <thead className="sticky top-0 z-10 bg-canvas border-b border-line shadow-xs">
                      <tr className="text-xs font-medium text-ink-muted">
                        <th scope="col" className="px-4 py-2.5 text-left font-medium">Module</th>
                        {permissionActions.map((a) => (
                          <th
                            key={a}
                            scope="col"
                            className="px-2 py-2.5 font-medium capitalize text-center w-20"
                          >
                            {a}
                          </th>
                        ))}
                        <th scope="col" className="px-3 py-2.5 font-medium text-center w-16">Row</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {permissionModules.map((m) => {
                        const modulePerms = newRoleMatrix[m.key] ?? [];
                        const isAllRowSelected = permissionActions.every((a) =>
                          modulePerms.includes(a)
                        );

                        return (
                          <tr key={m.key} className="hover:bg-subtle/30 transition-colors">
                            <td className="px-4 py-2 text-ink font-medium">
                              {m.label}
                            </td>
                            {permissionActions.map((a) => {
                              const checked = modulePerms.includes(a);
                              return (
                                <td key={a} className="px-2 py-2 text-center">
                                  <button
                                    type="button"
                                    aria-pressed={checked}
                                    aria-label={`${m.label} ${a}`}
                                    onClick={() => toggleNewRolePermission(m.key, a)}
                                    className={cn(
                                      'inline-flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer',
                                      checked
                                        ? 'border-ink bg-ink text-canvas'
                                        : 'border-line-strong hover:border-ink'
                                    )}
                                  >
                                    {checked && <Check className="h-3 w-3 stroke-[3]" />}
                                  </button>
                                </td>
                              );
                            })}
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                title="Toggle all actions for this module"
                                onClick={() => toggleNewRoleRowAll(m.key)}
                                className="text-xs text-ink-muted hover:text-ink font-medium px-1.5 py-0.5 rounded hover:bg-subtle transition-colors cursor-pointer"
                              >
                                {isAllRowSelected ? 'None' : 'All'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </Drawer>

        {/* Modal: Invite staff */}
        <Modal
          open={invite}
          onClose={() => setInvite(false)}
          title="Invite staff member"
          footer={
            <>
              <Button variant="ghost" onClick={() => setInvite(false)}>
                Cancel
              </Button>
              <Button
                disabled={!/^\S+@\S+\.\S+$/.test(email)}
                onClick={() => {
                  setMembers([
                    ...members,
                    {
                      id: `s${Date.now()}`,
                      name: email,
                      email,
                      role: inviteRole,
                      status: 'invited',
                      lastActive: '',
                      twoFactor: false,
                    },
                  ]);
                  setInvite(false);
                  setEmail('');
                  toast.success(`Invitation sent to ${email}`);
                }}
              >
                Send invite
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-canvas/50 p-3 text-xs text-ink-muted leading-relaxed">
              <span className="font-semibold text-ink">How staff invites work:</span> An invitation link will be sent to this email. The recipient can click the link to set up their password and activate their account.
            </div>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@tanti.com.bd"
              hint="Must be an active email address they have access to."
            />
            <Select
              label="Role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              options={roleList
                .filter((r) => r.name !== 'Owner')
                .map((r) => r.name)}
            />
          </div>
        </Modal>
      </div>
    </ModuleGate>
  );
}
