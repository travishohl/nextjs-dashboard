'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

const FormSchema = z.object({
  amount: z.coerce.number(), 
  customerId: z.string(),
  date: z.string(),
  id: z.string(),
  status: z.enum(['pending', 'paid']),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { amount, customerId, status } = CreateInvoice.parse({
    amount: formData.get('amount'),
    customerId: formData.get('customerId'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  console.log({ amount, amountInCents, customerId, date, status });

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
