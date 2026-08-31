import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import type { InvoiceListItem, PaginatedData } from '@/lib/types/portal-api';

/** Proxy GET /me/invoices?status=..&period=..&page=.. */
export async function GET(request: Request) {
  const { search } = new URL(request.url);
  const result = await callLaravel<PaginatedData<InvoiceListItem>>(`/me/invoices${search}`, {
    auth: true,
  });
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }
  return NextResponse.json(result.data);
}
