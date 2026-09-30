'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Check, Download, FileSpreadsheet, UploadCloud, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

type Step = 'upload' | 'preview' | 'done';
const steps: Step[] = ['upload', 'preview', 'done'];
const stepLabels = ['Upload file', 'Validate & preview', 'Import'];

const previewRows = [
  { row: 2, handle: 'rust-khadi-panjabi', title: 'Rust Khadi Panjabi', sku: 'TN-P21-RUS-M', price: '3,290', stock: '14', status: 'ok' as const, message: 'New product' },
  { row: 3, handle: 'rust-khadi-panjabi', title: '', sku: 'TN-P21-RUS-L', price: '3,290', stock: '9', status: 'ok' as const, message: 'Variant of row 2' },
  { row: 4, handle: 'sage-cotton-panjabi', title: 'Sage Cotton Panjabi', sku: 'TN-P03-SAG-M', price: '2,690', stock: '30', status: 'update' as const, message: 'Will update price & stock' },
  { row: 5, handle: 'ivory-linen-shirt', title: 'Ivory Linen Shirt', sku: 'TN-P22-IVO-S', price: 'abc', stock: '5', status: 'error' as const, message: 'Price must be a number' },
  { row: 6, handle: 'ivory-linen-shirt', title: '', sku: 'TN-P03-SAG-M', price: '2,450', stock: '5', status: 'error' as const, message: 'Duplicate SKU (used by row 4)' },
];

export default function AdminProductImportPage() {
  const [step, setStep] = useState<Step>('upload');
  const [overwrite, setOverwrite] = useState(true);
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const errors = previewRows.filter((r) => r.status === 'error').length;
  const idx = steps.indexOf(step);

  const run = async (to: Step) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setStep(to);
  };

  return (
    <ModuleGate module="products" action="create">
      <div className="w-full space-y-6">
        <PageHeader
          back={{ href: '/admin/products', label: 'Products' }}
          title="Import & export products"
          description="Bulk-create or update products, variants, prices and stock using CSV."
        />
        <ol className="mb-6 flex flex-wrap items-center gap-3 text-sm" aria-label="Import progress">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  i < idx
                    ? 'bg-ink text-canvas'
                    : i === idx
                    ? 'border-2 border-ink font-semibold'
                    : 'border border-line-strong text-ink-muted'
                )}
              >
                {i < idx ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={i === idx ? 'font-medium' : 'text-ink-muted'}>{stepLabels[i]}</span>
              {i < 2 && <span className="mx-1 h-px w-8 bg-line" />}
            </li>
          ))}
        </ol>

        {step === 'upload' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <Panel>
              <button
                type="button"
                onClick={() => run('preview')}
                disabled={loading}
                className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-line-strong px-6 py-14 text-center hover:border-ink cursor-pointer"
              >
                <UploadCloud className="h-8 w-8 text-ink-muted" aria-hidden />
                <p className="mt-3 text-sm font-medium">
                  {loading ? 'Reading file…' : 'Drop a CSV here or click to choose'}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Up to 5,000 rows · UTF-8 · demo uses tanti-products-sep.csv
                </p>
              </button>
              <div className="mt-5 space-y-2">
                <Checkbox
                  checked={overwrite}
                  onChange={setOverwrite}
                  label="Update existing products that match by handle or SKU"
                />
                <Checkbox
                  checked={publish}
                  onChange={setPublish}
                  label="Publish new products immediately"
                />
              </div>
            </Panel>
            <div className="space-y-6">
              <Panel title="Template">
                <p className="text-sm text-ink-muted">
                  Start from our template with all supported columns: handle, title, variant options, SKU, barcode, price, sale price, cost, stock per location, weight, SEO.
                </p>
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toast.success('Template downloaded')}
                  >
                    <Download className="h-4 w-4" aria-hidden /> Download template
                  </Button>
                </div>
              </Panel>
              <Panel title="Export">
                <p className="text-sm text-ink-muted">Export all products with variants and stock.</p>
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toast.success('Export started — we’ll email you the file')}
                  >
                    <FileSpreadsheet className="h-4 w-4" aria-hidden /> Export CSV
                  </Button>
                </div>
              </Panel>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <Panel
            title="tanti-products-sep.csv"
            description={`${previewRows.length} rows · 2 new, 1 update, ${errors} errors`}
            flush
          >
            {errors > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-b border-line bg-amber-500/10 px-5 py-3 text-sm text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" aria-hidden /> Rows with errors will be skipped. Fix them and re-upload, or continue with the valid rows.
                <button
                  type="button"
                  onClick={() => toast.success('Error report downloaded')}
                  className="ml-auto font-medium underline cursor-pointer"
                >
                  Download error report
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-ink-muted">
                    <th className="px-5 py-2 font-medium">Row</th>
                    <th className="px-3 py-2 font-medium">Handle</th>
                    <th className="px-3 py-2 font-medium">SKU</th>
                    <th className="px-3 py-2 font-medium">Price</th>
                    <th className="px-3 py-2 font-medium">Stock</th>
                    <th className="px-5 py-2 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {previewRows.map((r) => (
                    <tr
                      key={r.row}
                      className={r.status === 'error' ? 'bg-red-500/10' : ''}
                    >
                      <td className="px-5 py-2.5 text-ink-muted">{r.row}</td>
                      <td className="px-3 py-2.5">{r.handle}</td>
                      <td className="px-3 py-2.5 font-mono text-xs">{r.sku}</td>
                      <td className="px-3 py-2.5">{r.price}</td>
                      <td className="px-3 py-2.5">{r.stock}</td>
                      <td className="px-5 py-2.5">
                        <Badge
                          tone={
                            r.status === 'error'
                              ? 'danger'
                              : r.status === 'update'
                              ? 'info'
                              : 'success'
                          }
                        >
                          {r.message}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
              <Button variant="ghost" onClick={() => setStep('upload')}>
                Upload a different file
              </Button>
              <Button loading={loading} onClick={() => run('done')}>
                Import {previewRows.length - errors} rows
              </Button>
            </div>
          </Panel>
        )}

        {step === 'done' && (
          <Panel>
            <div className="py-10 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Check className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="mt-4 text-lg font-semibold">Import complete</h2>
              <p className="mt-1 text-sm text-ink-muted">
                1 product created with 2 variants · 1 product updated · {errors} rows skipped
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <Button variant="secondary" onClick={() => setStep('upload')}>
                  Import another file
                </Button>
                <Button href="/admin/products">View products</Button>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </ModuleGate>
  );
}
