import { styles as baseStyles } from "../productos-facil/styles"

// Same large-type, high-contrast look as "Mis productos (fácil)", plus the
// pieces this screen needs. Everything stays scoped under .nv.
export const styles = `${baseStyles}
.nv.nv-wide { max-width: 1040px; }
.nv .nv-btn:focus-visible, .nv .nv-link:focus-visible, .nv .nv-tab:focus-visible,
.nv summary:focus-visible, .nv select:focus, .nv a:focus-visible {
  outline: 3px solid #b08d57; outline-offset: 2px; }
.nv a { color: #111; }
.nv-demo { background: #fff4d6; border: 3px solid #8a5a00; color: #3d2800; padding: 16px 20px;
  border-radius: 10px; margin: 8px 0 20px; font-weight: 600; }
.nv-demo strong { text-transform: uppercase; letter-spacing: .04em; }
.nv-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 24px;
  border-bottom: 3px solid #111; }
.nv-tab { font-size: 22px; font-weight: 600; min-height: 60px; padding: 12px 24px;
  border: 2px solid #111; border-bottom: 0; border-radius: 10px 10px 0 0;
  background: #f3f1ec; color: #111; cursor: pointer; margin-bottom: -3px; }
.nv-tab[aria-selected="true"] { background: #111; color: #fff; }
@media (max-width: 600px) { .nv-tabs { border-bottom: 0; } .nv-tab { flex: 1 1 100%; border-bottom: 2px solid #111; border-radius: 10px; margin-bottom: 0; } }
.nv-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.nv-row .nv-btn { flex: 0 0 auto; }
.nv-filter .nv-btn { min-width: 170px; }
.nv-filter .nv-btn[aria-pressed="true"] { background: #111; color: #fff; }
.nv-list { list-style: none; padding: 0; margin: 16px 0; display: flex;
  flex-direction: column; gap: 16px; }
.nv-opp { background: #fff; border: 2px solid #d6d6d6; border-left-width: 10px;
  border-radius: 12px; padding: 20px 24px; }
.nv-opp h3 { font-size: 24px; font-weight: 600; margin: 8px 0; }
.nv-opp-reason { font-size: 21px; margin: 8px 0 12px; }
.nv-opp-meta { display: flex; flex-wrap: wrap; gap: 8px 24px; color: #333; margin-bottom: 12px; }
.nv-opp-price { font-size: 22px; font-weight: 700; color: #111; }
.nv-badge { display: inline-block; font-size: 18px; font-weight: 700; padding: 4px 12px;
  border-radius: 999px; border: 2px solid currentColor; }
.nv-act-comprar { border-left-color: #1f6f43; } .nv-badge-comprar { color: #1f6f43; }
.nv-act-destacar { border-left-color: #8a5a00; } .nv-badge-destacar { color: #6b4500; }
.nv-act-subir_precio { border-left-color: #1d4f91; } .nv-badge-subir_precio { color: #1d4f91; }
.nv-act-bajar_precio { border-left-color: #6a2c91; } .nv-badge-bajar_precio { color: #5a237d; }
.nv-act-no_competir { border-left-color: #b3261e; } .nv-badge-no_competir { color: #9a1f18; }
.nv-badge-demo { color: #6b4500; background: #fff4d6; margin-left: 8px; }
.nv-score { font-weight: 700; }
.nv details { margin: 8px 0; }
.nv summary { cursor: pointer; font-weight: 600; text-decoration: underline; padding: 6px 0; }
.nv-factors { list-style: none; padding: 0; margin: 8px 0; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px 16px; font-size: 18px; }
.nv-factors li { background: #f7f6f2; border-radius: 8px; padding: 8px 12px; }
.nv-btn-done { background: #1f6f43; border-color: #1f6f43; color: #fff; }
.nv-btn-small { font-size: 18px; min-height: 48px; padding: 8px 16px; }
.nv-card-box { background: #fff; border: 1px solid #d6d6d6; border-radius: 12px; padding: 20px 24px; }
.nv-card-box h3 { font-size: 24px; margin: 0 0 4px; }
.nv-muted { color: #444; }
.nv-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 19px; }
.nv-table th { text-align: left; border-bottom: 2px solid #111; padding: 8px; font-size: 18px; }
.nv-table td { border-bottom: 1px solid #ddd; padding: 10px 8px; vertical-align: top; }
.nv-table-wrap { overflow-x: auto; }
.nv-stock-in { color: #1f6f43; font-weight: 700; }
.nv-stock-out { color: #9a1f18; font-weight: 700; }
.nv-select { width: 100%; font-size: 20px; padding: 12px 16px; min-height: 56px;
  border: 2px solid #8a8a8a; border-radius: 8px; background: #fff; color: #111; }
.nv-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0 20px; }
.nv-section { margin: 32px 0; }
.nv-section > h2 { font-size: 28px; }
.nv-small { font-size: 17px; }
.nv-weights { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0 16px; }
.nv-file { font-size: 20px; padding: 12px 0; }
`
