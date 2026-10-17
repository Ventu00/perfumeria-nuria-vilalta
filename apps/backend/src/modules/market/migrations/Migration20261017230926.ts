import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261017230926 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "market_competitor" ("id" text not null, "name" text not null, "website" text null, "is_active" boolean not null default true, "notes" text null, "is_demo" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "market_competitor_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_competitor_deleted_at" ON "market_competitor" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "market_competitor_listing" ("id" text not null, "url" text not null, "ean" text not null, "title" text null, "variant_id" text null, "is_active" boolean not null default true, "last_status" text null, "last_message" text null, "last_read_at" timestamptz null, "is_demo" boolean not null default false, "competitor_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "market_competitor_listing_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_competitor_listing_competitor_id" ON "market_competitor_listing" ("competitor_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_competitor_listing_deleted_at" ON "market_competitor_listing" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_competitor_listing_ean" ON "market_competitor_listing" ("ean") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "market_demand_signal" ("id" text not null, "ean" text null, "brand" text null, "interest" integer not null, "growth_pct" integer not null default 0, "source" text not null, "read_at" timestamptz not null, "is_demo" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "market_demand_signal_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_demand_signal_deleted_at" ON "market_demand_signal" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "market_opportunity" ("id" text not null, "ean" text null, "variant_id" text null, "brand" text null, "product_title" text not null, "score" real not null, "action" text check ("action" in ('comprar', 'subir_precio', 'bajar_precio', 'destacar', 'no_competir')) not null, "suggested_price" numeric null, "reason" text not null, "status" text check ("status" in ('pendiente', 'hecha', 'descartada')) not null default 'pendiente', "factors" jsonb null, "computed_at" timestamptz not null, "decided_at" timestamptz null, "is_demo" boolean not null default false, "raw_suggested_price" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "market_opportunity_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_opportunity_deleted_at" ON "market_opportunity" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_opportunity_status" ON "market_opportunity" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_opportunity_ean" ON "market_opportunity" ("ean") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "market_price_snapshot" ("id" text not null, "price" numeric null, "regular_price" numeric null, "currency_code" text not null default 'eur', "availability" text check ("availability" in ('in_stock', 'out_of_stock', 'limited', 'preorder', 'unknown')) not null default 'unknown', "is_promo" boolean not null default false, "source" text not null, "read_at" timestamptz not null, "is_demo" boolean not null default false, "listing_id" text not null, "raw_price" jsonb null, "raw_regular_price" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "market_price_snapshot_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_price_snapshot_listing_id" ON "market_price_snapshot" ("listing_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_price_snapshot_deleted_at" ON "market_price_snapshot" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_price_snapshot_listing_id_read_at" ON "market_price_snapshot" ("listing_id", "read_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "market_setting" ("id" text not null, "weight_demand" real not null default 0.35, "weight_margin" real not null default 0.3, "weight_gap" real not null default 0.25, "weight_pressure" real not null default 0.1, "min_margin_pct" real not null default 25, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "market_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_setting_deleted_at" ON "market_setting" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "market_supplier" ("id" text not null, "name" text not null, "contact_name" text null, "email" text null, "phone" text null, "min_order_amount" numeric null, "lead_time_days" integer null, "payment_terms" text null, "notes" text null, "is_demo" boolean not null default false, "raw_min_order_amount" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "market_supplier_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_supplier_deleted_at" ON "market_supplier" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "market_supplier_offer" ("id" text not null, "ean" text not null, "product_name" text null, "brand" text null, "cost" numeric not null, "min_units" integer not null default 1, "tariff_date" timestamptz not null, "is_demo" boolean not null default false, "supplier_id" text not null, "raw_cost" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "market_supplier_offer_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_supplier_offer_supplier_id" ON "market_supplier_offer" ("supplier_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_supplier_offer_deleted_at" ON "market_supplier_offer" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_market_supplier_offer_ean" ON "market_supplier_offer" ("ean") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "market_competitor_listing" add constraint "market_competitor_listing_competitor_id_foreign" foreign key ("competitor_id") references "market_competitor" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table if exists "market_price_snapshot" add constraint "market_price_snapshot_listing_id_foreign" foreign key ("listing_id") references "market_competitor_listing" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table if exists "market_supplier_offer" add constraint "market_supplier_offer_supplier_id_foreign" foreign key ("supplier_id") references "market_supplier" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "market_competitor_listing" drop constraint if exists "market_competitor_listing_competitor_id_foreign";`);

    this.addSql(`alter table if exists "market_price_snapshot" drop constraint if exists "market_price_snapshot_listing_id_foreign";`);

    this.addSql(`alter table if exists "market_supplier_offer" drop constraint if exists "market_supplier_offer_supplier_id_foreign";`);

    this.addSql(`drop table if exists "market_competitor" cascade;`);

    this.addSql(`drop table if exists "market_competitor_listing" cascade;`);

    this.addSql(`drop table if exists "market_demand_signal" cascade;`);

    this.addSql(`drop table if exists "market_opportunity" cascade;`);

    this.addSql(`drop table if exists "market_price_snapshot" cascade;`);

    this.addSql(`drop table if exists "market_setting" cascade;`);

    this.addSql(`drop table if exists "market_supplier" cascade;`);

    this.addSql(`drop table if exists "market_supplier_offer" cascade;`);
  }

}
