(function(root){
  'use strict';
  const paths={
    all:'<rect x="3.5" y="3.5" width="6" height="6" rx="1.5"/><rect x="14.5" y="3.5" width="6" height="6" rx="1.5"/><rect x="3.5" y="14.5" width="6" height="6" rx="1.5"/><rect x="14.5" y="14.5" width="6" height="6" rx="1.5"/>',
    recommended:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
    favorites:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
    applied:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M10 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4"/>',
    ignored:'<circle cx="12" cy="12" r="8.5"/><path d="M8 12h8"/>',
    internship:'<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12c5 3 13 3 18 0M10 13v3h4v-3"/>',
    competition:'<path d="m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
    scholarship:'<path d="m2.5 8 9.5-5 9.5 5-9.5 5ZM6 10v6c3.5 3 8.5 3 12 0v-6M21.5 8v8"/>',
    event:'<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4m8-4v4M4 10h16M8 14h2m4 0h2m-8 3h2"/>',
    exchange:'<path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4"/>',
    networking:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2"/>',
    settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="8" cy="18" r="2" fill="currentColor" stroke="none"/>',
    audit:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6m-6 4h6m-6 4h4"/>',
    brand:'<rect x="3" y="5" width="18" height="14" rx="4"/><path d="m4.5 7 7.5 6 7.5-6M15.5 3v4m-2-2h4"/>',
    globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'
  };
  function icon(name){return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.all)+'</svg>';}
  function boot(){
    document.querySelectorAll('.brand-mark').forEach(node=>node.innerHTML=icon('brand'));
    document.querySelectorAll('[data-view]').forEach(node=>{const slot=node.querySelector('span');if(slot)slot.innerHTML=icon(node.dataset.view);});
    for(const [selector,key]of [['#edit-profile span','settings'],['#audit-link span','audit']]){const node=document.querySelector(selector);if(node)node.innerHTML=icon(key);}
    document.querySelectorAll('[data-icon]').forEach(node=>node.innerHTML=icon(node.dataset.icon));
  }
  const api={icon,boot};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MailPhorIcons=api;
})(typeof globalThis!=='undefined'?globalThis:this);
