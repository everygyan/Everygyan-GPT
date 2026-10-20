// Supabase Edge Function: n8n-draft-ingest
// Security Invariant: Can strictly create drafts. Cannot publish, delete, or read subscriber data.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-n8n-secret, x-idempotency-key",
};

const ALLOWED_CATEGORIES = ["tech", "health", "geopolitics", "sports", "travel", "learning"];
const MAX_PAYLOAD_SIZE = 500 * 1024; // 500 KB limit

serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  // 2. HTTP Method restriction
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method Not Allowed: Only POST is accepted." }),
      { status: 405, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  // 3. Shared Secret Verification
  const expectedSecret = Deno.env.get("N8N_INGEST_SECRET");
  if (!expectedSecret) {
    return new Response(
      JSON.stringify({ success: false, error: "Configuration Error: Ingest secret not configured." }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const providedSecret =
    req.headers.get("x-n8n-secret") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!providedSecret || providedSecret !== expectedSecret) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Invalid or missing webhook secret." }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  // 4. Payload Size Check
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_PAYLOAD_SIZE) {
    return new Response(
      JSON.stringify({ success: false, error: `Payload Too Large: Maximum allowed size is 500 KB.` }),
      { status: 413, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  // 5. Parse Payload
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Bad Request: Malformed JSON payload." }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  // 6. Security Violations & Prohibited Action Guards
  if (payload.action === "delete" || payload.delete === true) {
    return new Response(
      JSON.stringify({ success: false, error: "Forbidden: Deletions cannot be performed via ingest webhook." }),
      { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  if (payload.status && payload.status !== "draft") {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Forbidden: Automated workflows cannot set status to '${payload.status}'. Status is strictly locked to 'draft'.`,
      }),
      { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  // 7. Field Validations
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const content = typeof payload.content === "string" ? payload.content.trim() : "";
  const category = typeof payload.category === "string" ? payload.category.trim().toLowerCase() : "";

  if (title.length < 5) {
    return new Response(
      JSON.stringify({ success: false, error: 'Validation Error: "title" must be at least 5 characters.' }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  if (content.length < 50) {
    return new Response(
      JSON.stringify({ success: false, error: 'Validation Error: "content" must be at least 50 characters.' }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Validation Error: Invalid category '${category}'. Allowed: ${ALLOWED_CATEGORIES.join(", ")}.`,
      }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  const sourceUrls = payload.source_urls;
  if (!Array.isArray(sourceUrls) || sourceUrls.length === 0) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Validation Error: At least one verified source URL ("source_urls") is required.',
      }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  // 8. Idempotency Key
  const idempotencyKey =
    req.headers.get("x-idempotency-key") ||
    (typeof payload.request_id === "string" ? payload.request_id : null) ||
    `idemp-${title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30)}`;

  // 9. Initialize Supabase Client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check audit_logs for duplicate submission
  const { data: existingAudit } = await supabase
    .from("audit_logs")
    .select("entity_id, created_at")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existingAudit) {
    return new Response(
      JSON.stringify({
        success: true,
        idempotent_replay: true,
        message: "Draft already ingested previously.",
        data: {
          article_id: existingAudit.entity_id,
          title,
          status: "draft",
          review_url: `https://everygyan.com/dashboard/articles/${existingAudit.entity_id}/edit`,
        },
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  // Slug generation
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // Author resolution (fallback to admin/bot profile)
  const botAuthorId = Deno.env.get("N8N_AUTHOR_ID");
  let authorId = botAuthorId;
  if (!authorId) {
    const { data: botProfile } = await supabase
      .from("profiles")
      .select("id")
      .in("role", ["admin", "editor", "author"])
      .limit(1)
      .single();
    authorId = botProfile?.id;
  }

  // Insert Draft
  const { data: article, error: insertError } = await supabase
    .from("articles")
    .insert({
      title,
      slug: baseSlug,
      excerpt: typeof payload.excerpt === "string" ? payload.excerpt : content.slice(0, 160) + "...",
      content,
      category: category.charAt(0).toUpperCase() + category.slice(1),
      category_slug: category,
      tags: Array.isArray(payload.tags) ? payload.tags : ["Automated Draft", category],
      cover_image: typeof payload.cover_image === "string" ? payload.cover_image : null,
      cover_caption: typeof payload.cover_caption === "string" ? payload.cover_caption : null,
      status: "draft", // Hard invariant: strictly draft
      author_id: authorId,
      references: sourceUrls,
      template_type: typeof payload.template_type === "string" ? payload.template_type : "standard",
      template_data: typeof payload.template_data === "object" ? payload.template_data : {},
    })
    .select("id, title, slug, status, created_at")
    .single();

  if (insertError) {
    return new Response(
      JSON.stringify({ success: false, error: `Database Error: ${insertError.message}` }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  // Record Audit Log Entry
  await supabase.from("audit_logs").insert({
    event_type: "n8n_draft_created",
    entity_type: "article",
    entity_id: article.id,
    idempotency_key: idempotencyKey,
    actor: "n8n_integration",
    metadata: { title, slug: article.slug, category, sources_count: sourceUrls.length },
  });

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        article_id: article.id,
        title: article.title,
        slug: article.slug,
        status: "draft",
        review_url: `https://everygyan.com/dashboard/articles/${article.id}/edit`,
        created_at: article.created_at,
      },
    }),
    { status: 201, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
});
