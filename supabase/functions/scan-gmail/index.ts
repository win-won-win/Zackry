import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ScanRequest {
  accessToken: string;
  period: '6months' | '1year' | '2years';
  userId: string;
}

interface GmailMessage {
  id: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{ mimeType: string; body: { data?: string } }>;
    body?: { data?: string };
  };
  snippet: string;
}

function decodeBase64(data: string): string {
  try {
    const decoded = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    return decoded;
  } catch {
    return '';
  }
}

function extractEmailBody(message: GmailMessage): string {
  let bodyText = message.snippet || '';

  if (message.payload.body?.data) {
    bodyText += ' ' + decodeBase64(message.payload.body.data);
  }

  if (message.payload.parts) {
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        bodyText += ' ' + decodeBase64(part.body.data);
      }
    }
  }

  return bodyText;
}

function extractAmount(text: string): number | null {
  const patterns = [
    /請求額[：:\s]*[¥￥]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /金額[：:\s]*[¥￥]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /[¥￥]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*円/g,
    /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    /(?:^|\s)(\d{1,3}(?:,\d{3})+)(?:\s|$)/g,
  ];

  const amounts: number[] = [];

  for (const pattern of patterns) {
    let match;
    const regex = new RegExp(pattern);
    while ((match = regex.exec(text)) !== null) {
      const amountStr = match[1].replace(/,/g, '');
      const amount = Math.round(parseFloat(amountStr));
      if (amount >= 100 && amount <= 100000) {
        amounts.push(amount);
      }
    }
  }

  if (amounts.length === 0) return null;

  const sortedAmounts = amounts.sort((a, b) => b - a);
  return sortedAmounts[0];
}

function extractCycle(text: string): string | null {
  const monthlyPatterns = /月額|monthly|毎月|per month|\/month/i;
  const yearlyPatterns = /年額|yearly|毎年|annual|per year|\/year/i;

  if (yearlyPatterns.test(text)) return 'yearly';
  if (monthlyPatterns.test(text)) return 'monthly';

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { accessToken, period, userId }: ScanRequest = await req.json();

    if (!accessToken || !period || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const monthsAgo = period === '6months' ? 6 : period === '1year' ? 12 : 24;
    const afterDate = new Date();
    afterDate.setMonth(afterDate.getMonth() - monthsAgo);
    const afterDateStr = afterDate.toISOString().split('T')[0].replace(/-/g, '/');

    const searchQuery = `(subscription OR ご請求 OR ご利用料金 OR 請求金額 OR receipt OR invoice OR payment OR billing OR 支払い OR お支払い OR 月額 OR サブスク OR 会費 OR membership) after:${afterDateStr}`;

    const messagesUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=100`;

    const messagesResponse = await fetch(messagesUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text();
      console.error('Gmail API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Gmail messages', details: errorText }),
        {
          status: messagesResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const messagesData = await messagesResponse.json();
    const messageIds = messagesData.messages || [];
    const totalMatches = messageIds.length;

    const candidates = [];
    const PROCESS_LIMIT = 50;
    let processedCount = 0;
    let withAmountCount = 0;
    let withoutAmountCount = 0;

    for (const { id } of messageIds.slice(0, PROCESS_LIMIT)) {
      try {
        const messageUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`;
        const messageResponse = await fetch(messageUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!messageResponse.ok) continue;

        const message: GmailMessage = await messageResponse.json();
        const headers = message.payload.headers;

        const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
        const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');

        const from = fromHeader?.value || '';
        const subject = subjectHeader?.value || '';

        const bodyText = extractEmailBody(message);
        const detectedAmount = extractAmount(bodyText);
        const detectedCycle = extractCycle(bodyText);

        if (detectedAmount) {
          withAmountCount++;
        } else {
          withoutAmountCount++;
        }

        candidates.push({
          user_id: userId,
          gmail_message_id: id,
          from_address: from,
          subject: subject,
          detected_amount: detectedAmount,
          detected_currency: 'JPY',
          detected_cycle: detectedCycle,
          status: 'pending',
        });

        processedCount++;
      } catch (error) {
        console.error(`Error processing message ${id}:`, error);
        continue;
      }
    }

    if (candidates.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('subscription_candidates')
        .insert(candidates);

      if (insertError) {
        console.error('Error inserting candidates:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to save candidates to database', details: insertError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        statistics: {
          totalMatches: totalMatches,
          processedCount: processedCount,
          savedCandidates: candidates.length,
          withAmount: withAmountCount,
          withoutAmount: withoutAmountCount,
          searchPeriod: period,
          searchQuery: searchQuery,
        },
        message: `スキャン完了: ${totalMatches}件中${processedCount}件を処理し、${candidates.length}件の候補を保存しました`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in scan-gmail function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});