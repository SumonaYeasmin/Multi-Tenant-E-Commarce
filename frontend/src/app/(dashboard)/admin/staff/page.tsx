'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, ShieldCheck, Check } from 'lucide-react';
import {
  staff as seedStaff,
  roles,
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
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { AdminRole, PermissionAction, AdminModule } from '@/types/commerce';

const roleKey: Record<string, AdminRole | undefined> = {
  Owner: 'owner',
  'Store Manager': 'manager',
  'Fulfillment Staff': 'fulfillment',
};
type Matrix = Record<string, PermissionAction[]>;

function buildMatrix(name: string): Matrix {
  const base = rolePermissions[roleKey[name] ?? 'fulfillment'] as Partial<
    Record<AdminModule, PermissionAction[]>
  >;
  return Object.fromEntries(
    permissionModules.map((m) => [
      m.key,
      name === 'Owner'
        ? [...permissionActions]
        : [...(base[m.key as AdminModule] ?? [])],
    ])
  );
}

export default function AdminStaffPage() {
  const { can } = useAdmin();
  const [tab, setTab] = useState<'members' | 'roles'>('members');
  const [members, setMembers] = useState(seedStaff);
  const [invite, setInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Store Manager');
  const [activeRole, setActiveRole] = useState('Store Manager');
  const [matrix, setMatrix] = useState<Matrix>(() => buildMatrix('Store Manager'));
  const locked = activeRole === 'Owner' || !can('staff', 'update');

  const pickRole = (name: string) => {
    setActiveRole(name);
    setMatrix(buildMatrix(name));
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

        {tab === 'members' && (
          <Panel flush>
            <ul className="divide-y divide-line">
              {members.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-3.5 hover:bg-subtle/30"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-subtle text-xs font-semibold text-ink">
                    {s.status === 'invited'
                      ? '@'
                      : s.name
                          .split(' ')
                          .map((x) => x[0])
                          .join('')}
                  </span>
                  <div className="min-w-[180px] flex-1">
                    <p className="text-sm font-medium text-ink">{s.name}</p>
                    <p className="text-xs text-ink-muted">
                      {s.email}
                      {s.lastActive && ` · active ${timeAgo(s.lastActive)}`}
                    </p>
                  </div>
                  <span className="text-sm text-ink-soft">{s.role}</span>
                  {s.twoFactor ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> 2FA
                    </span>
                  ) : (
                    <span className="text-xs text-ink-muted">No 2FA</span>
                  )}
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
                  {s.role !== 'Owner' && (
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
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === 'roles' && (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Panel
              title="Roles"
              flush
              actions={
                <GuardedButton
                  module="staff"
                  action="create"
                  size="sm"
                  variant="ghost"
                  onClick={() => toast.success('Custom role created')}
                >
                  New
                </GuardedButton>
              }
            >
              <ul className="py-1">
                {roles.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => pickRole(r.name)}
                      aria-current={activeRole === r.name}
                      className={cn(
                        'w-full px-5 py-2.5 text-left cursor-pointer transition-colors',
                        activeRole === r.name ? 'bg-canvas' : 'hover:bg-canvas'
                      )}
                    >
                      <p className="text-sm font-medium text-ink">
                        {r.name}{' '}
                        <span className="font-normal text-ink-muted">
                          · {r.members}
                        </span>
                      </p>
                      <p className="text-xs text-ink-muted">{r.description}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
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
                    onClick={() => toast.success('Permissions saved')}
                  >
                    Save
                  </Button>
                )
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs text-ink-muted">
                      <th className="px-5 py-2 text-left font-medium">Module</th>
                      {permissionActions.map((a) => (
                        <th
                          key={a}
                          className="px-2 py-2 font-medium capitalize text-center"
                        >
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {permissionModules.map((m) => (
                      <tr key={m.key} className="hover:bg-subtle/30">
                        <td className="px-5 py-2 font-medium text-ink">
                          {m.label}
                        </td>
                        {permissionActions.map((a) => {
                          const on = !!matrix[m.key]?.includes(a);
                          return (
                            <td key={a} className="px-2 py-2 text-center">
                              <button
                                type="button"
                                disabled={locked}
                                aria-pressed={on}
                                aria-label={`${m.label} ${a}`}
                                onClick={() =>
                                  setMatrix((x) => ({
                                    ...x,
                                    [m.key]: on
                                      ? (x[m.key] ?? []).filter((y) => y !== a)
                                      : [...(x[m.key] ?? []), a],
                                  }))
                                }
                                className={cn(
                                  'inline-flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer',
                                  on
                                    ? 'border-ink bg-ink text-canvas'
                                    : 'border-line-strong hover:border-ink',
                                  locked && 'opacity-60 cursor-not-allowed'
                                )}
                              >
                                {on && <Check className="h-3 w-3" />}
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

        <Modal
          open={invite}
          onClose={() => setInvite(false)}
          title="Invite staff"
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
                      ...members[0],
                      id: `s${Date.now()}`,
                      name: email,
                      email,
                      role,
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
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@tanti.com.bd"
            />
            <Select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={roles
                .filter((r) => r.name !== 'Owner')
                .map((r) => r.name)}
            />
          </div>
        </Modal>
      </div>
    </ModuleGate>
  );
}
