// Large type, high contrast and big tap targets for older staff members.
// Scoped under .nv so it never leaks into the rest of the admin.
export const styles = `
.nv { max-width: 760px; margin: 0 auto; padding: 24px 16px 96px; color: #111;
  font-size: 20px; line-height: 1.5; font-family: Inter, system-ui, sans-serif; }
.nv h1 { font-family: "Cormorant Garamond", Georgia, serif; font-size: 40px;
  font-weight: 600; margin: 16px 0 4px; }
.nv h2 { font-size: 24px; font-weight: 600; margin: 0 0 8px;
  display: flex; align-items: center; gap: 12px; }
.nv-help { color: #3d3d3d; margin: 4px 0 16px; }
.nv-header { margin-bottom: 16px; }
.nv-label { display: block; font-weight: 600; margin: 20px 0 8px; }
.nv-optional { font-weight: 400; color: #555; }
.nv-input { width: 100%; font-size: 20px; padding: 14px 16px; min-height: 56px;
  border: 2px solid #8a8a8a; border-radius: 8px; background: #fff; color: #111; }
.nv-input:focus { outline: 3px solid #b08d57; outline-offset: 2px; border-color: #111; }
.nv-input:disabled { background: #f1f1f1; color: #555; }
.nv-textarea { min-height: 220px; resize: vertical; }
.nv-textarea-small { min-height: 140px; }
.nv-lang { border-top: 1px solid #e3e3e3; margin-top: 16px; padding-top: 8px; }
.nv-lang h3 { font-size: 22px; font-weight: 600; margin: 8px 0 0; }
.nv-btn { font-size: 20px; font-weight: 600; min-height: 56px; padding: 12px 24px;
  border-radius: 8px; border: 2px solid #111; cursor: pointer; }
.nv-btn:disabled { opacity: .6; cursor: wait; }
.nv-btn-primary { background: #111; color: #fff; }
.nv-btn-secondary { background: #fff; color: #111; }
.nv-btn-on { background: #1f6f43; border-color: #1f6f43; color: #fff; }
.nv-btn-ghost { background: transparent; border-color: transparent; padding-left: 0; }
.nv-btn-big { width: 100%; min-height: 72px; font-size: 24px; margin: 16px 0 24px; }
.nv-link { background: none; border: 0; color: #111; text-decoration: underline;
  font-size: 18px; cursor: pointer; padding: 8px 0; }
.nv-step { background: #fff; border: 1px solid #d6d6d6; border-radius: 12px;
  padding: 24px; margin: 20px 0; }
.nv-num { display: inline-flex; width: 40px; height: 40px; border-radius: 50%;
  background: #111; color: #fff; align-items: center; justify-content: center; font-size: 20px; }
.nv-photos { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px; }
.nv-photos figure { margin: 0; width: 160px; }
.nv-photos img { width: 160px; height: 160px; object-fit: cover; border-radius: 8px;
  border: 1px solid #ccc; }
.nv-photos figcaption { font-size: 16px; font-weight: 600; }
.nv-price { display: flex; align-items: center; gap: 12px; max-width: 280px; font-size: 24px; }
.nv-choice { display: flex; flex-wrap: wrap; gap: 12px; }
.nv-choice .nv-btn { flex: 1 1 200px; }
.nv-error { background: #fdecea; border: 2px solid #b3261e; color: #7a1a14;
  padding: 16px; border-radius: 8px; font-weight: 600; }
.nv-ok { background: #e6f4ea; border: 2px solid #1f6f43; color: #0f3d24;
  padding: 16px; border-radius: 8px; font-weight: 600; margin-bottom: 16px;
  display: flex; justify-content: space-between; gap: 16px; align-items: center; }
.nv-grid { list-style: none; padding: 0; margin: 24px 0; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.nv-card { width: 100%; text-align: left; background: #fff; border: 1px solid #d6d6d6;
  border-radius: 12px; padding: 12px; cursor: pointer; display: flex; flex-direction: column; gap: 6px;
  font-size: 18px; color: #111; }
.nv-card:hover, .nv-card:focus { border-color: #111; outline: none; }
.nv-card img, .nv-card-noimg { width: 100%; aspect-ratio: 1; object-fit: cover;
  border-radius: 8px; background: #f3f1ec; display: flex; align-items: center; justify-content: center; color: #555; }
.nv-card-title { font-weight: 600; }
.nv-card-price { font-size: 20px; }
.nv-tag { font-size: 16px; color: #555; }
.nv-tag-on { color: #1f6f43; font-weight: 600; }
.nv-card-edit { margin-top: 4px; text-align: center; border: 2px solid #111;
  border-radius: 8px; padding: 8px; font-weight: 600; }
`
