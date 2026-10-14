/* ============================================
   VGC COMMON - ONE FILE FOR ALL PAGES
   Include this ONE file before </body> in any new page:
   <script src="/vgc-common.js"></script>
   - Loads GA4 (G-2BZDPM9EZM)
   - Database logic (CV -> GDrive)
   - Mask / VPN detector (No blocking, GA4 logging)
   Duplicate-safe: can be included multiple times without error
   ============================================ */
(function(){
  if(window.__vgcCommonLoaded) return;
  window.__vgcCommonLoaded = true;

  // 1. GA4 Loader + Init
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){dataLayer.push(arguments);};
  if(!document.querySelector('script[src*="googletagmanager.com/gtag/js?id=G-2BZDPM9EZM"]')){
    var gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-2BZDPM9EZM';
    document.head.appendChild(gtagScript);
  }
  window.gtag('js', new Date());
  window.gtag('config', 'G-2BZDPM9EZM');

  // 2. VGC CONFIG - safe global
  window.VGC_APPS_SCRIPT_URL = window.VGC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyUF9V9Mfw5HKFAW-07iZBwSCJjguCHbUi39_cK-3c6MmRKdzNmdA2EutgUFF17EW1P/exec';
  window.VGC_WHATSAPP_NUMBER = window.VGC_WHATSAPP_NUMBER || '918589895659';
  var VGC_APPS_SCRIPT_URL = window.VGC_APPS_SCRIPT_URL;
  var VGC_WHATSAPP_NUMBER = window.VGC_WHATSAPP_NUMBER;

  // 3. DATABASE LOGIC - Modal + Upload
  window.openRegisterModal = function(type){
    var modal = document.getElementById('vgc-register-modal');
    if(!modal) return;
    modal.style.display='flex';
    document.body.style.overflow='hidden';
    var cand = document.getElementById('candidate-form-box');
    var emp = document.getElementById('employer-form-box');
    if(type==='candidate'){
      if(cand) cand.style.display='block';
      if(emp) emp.style.display='none';
    } else {
      if(cand) cand.style.display='none';
      if(emp) emp.style.display='block';
    }
    if(typeof window.gtag!=='undefined') window.gtag('event','registration_modal_open',{type:type});
  };
  window.closeRegisterModal = function(){
    var modal = document.getElementById('vgc-register-modal');
    if(!modal) return;
    modal.style.display='none';
    document.body.style.overflow='';
  };
  // Close on outside click
  document.addEventListener('click', function(e){
    var m = document.getElementById('vgc-register-modal');
    if(m && e.target===m) window.closeRegisterModal();
  });

  window.fileToBase64 = function(file){
    return new Promise((resolve, reject)=>{
      var reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  window.submitCandidate = async function(e){
    e.preventDefault();
    var f=e.target;
    var fileInput = document.getElementById('cv_file');
    var file = fileInput ? fileInput.files[0] : null;
    if(!file){ alert('Please attach your CV'); return; }
    if(file.size > 5*1024*1024){ alert('Max 5MB'); return; }
    var btn = document.getElementById('btnCandidateSubmit');
    var progress = document.getElementById('uploadProgress');
    if(btn){ btn.disabled=true; btn.textContent='⏳ Uploading...'; }
    if(progress) progress.style.display='block';
    try{
      var base64 = await window.fileToBase64(file);
      var data={
        type:'candidate', timestamp:new Date().toISOString(),
        name:f.name.value.trim(), whatsapp:f.whatsapp.value.trim(),
        email:f.email.value.trim(), qualification:f.qualification.value,
        experience:f.experience.value, target_country:f.target_country.value,
        location:f.location.value.trim(), message:f.message.value.trim(),
        cv_name: file.name, cv_type: file.type || 'application/pdf',
        cv_base64: base64.split(',')[1], source: 'venadglobal.org'
      };
      var existing=JSON.parse(localStorage.getItem('vgc_candidates')||'[]');
      existing.push(Object.assign({}, data, {cv_base64: '[saved to drive]'}));
      localStorage.setItem('vgc_candidates', JSON.stringify(existing));
      if(!VGC_APPS_SCRIPT_URL.includes('REPLACE')){
        var res = await fetch(VGC_APPS_SCRIPT_URL, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(data)});
        var result = await res.json();
        if(result.status === 'ok'){
          var waMsg = `*NEW CANDIDATE*%0AName: ${data.name}%0AWhatsApp: ${data.whatsapp}%0ATarget: ${data.target_country}%0ACV: ${result.cvLink || 'Drive'}%0A— venadglobal.org`;
          window.open('https://wa.me/'+VGC_WHATSAPP_NUMBER+'?text='+waMsg, '_blank');
          alert('✅ CV Uploaded! WhatsApp opened.');
        }
      }
      window.closeRegisterModal(); f.reset();
      var nameEl = document.getElementById('cv_file_name'); if(nameEl) nameEl.textContent='';
    }catch(err){ console.error(err); alert('Upload failed, WhatsApp Antony directly +91 85898 95659'); }
    finally{ if(btn){ btn.disabled=false; btn.textContent='✅ Upload CV & Register FREE'; } if(progress) progress.style.display='none'; }
  };

  window.submitEmployer = async function(e){
    e.preventDefault();
    var f=e.target;
    var fileInput = document.getElementById('employer_doc');
    var file = fileInput && fileInput.files[0] ? fileInput.files[0] : null;
    var btn = document.getElementById('btnEmployerSubmit');
    if(btn){ btn.disabled=true; btn.textContent='⏳ Uploading...'; }
    try{
      var cv_b64=null, cv_name=null, cv_type=null;
      if(file){ var b=await window.fileToBase64(file); cv_b64=b.split(',')[1]; cv_name=file.name; cv_type=file.type; }
      var data={ type:'employer', timestamp:new Date().toISOString(), company:f.company.value.trim(), contact_person:f.contact_person.value.trim(), designation:f.designation.value.trim(), email:f.email.value.trim(), phone:f.phone.value.trim(), country:f.country.value.trim(), company_type:f.company_type.value, workers_needed:f.workers_needed.value, positions:f.positions.value, salary:f.salary.value, message:f.message.value.trim(), cv_name:cv_name, cv_type:cv_type, cv_base64:cv_b64, source:'venadglobal.org employer' };
      var existing=JSON.parse(localStorage.getItem('vgc_employers')||'[]'); existing.push(Object.assign({}, data, {cv_base64:'[saved]'})); localStorage.setItem('vgc_employers', JSON.stringify(existing));
      if(!VGC_APPS_SCRIPT_URL.includes('REPLACE')){ await fetch(VGC_APPS_SCRIPT_URL, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(data)}); }
      var waMsg=`*NEW EMPLOYER*%0ACompany: ${data.company}%0AContact: ${data.contact_person}%0A— venadglobal.org`;
      window.open('https://wa.me/'+VGC_WHATSAPP_NUMBER+'?text='+waMsg, '_blank');
      alert('✅ Employer registered!'); window.closeRegisterModal(); f.reset();
    }catch(err){ console.error(err); }
    finally{ if(btn){ btn.disabled=false; btn.textContent='🏥 Upload & Register as Employer'; } }
  };

  // File name preview (auto bind)
  document.addEventListener('DOMContentLoaded', function(){
    var cvInput = document.getElementById('cv_file');
    if(cvInput){
      cvInput.addEventListener('change', function(e){
        var f = e.target.files[0];
        var el = document.getElementById('cv_file_name');
        if(f && el) el.textContent = '📎 ' + f.name + ' (' + (f.size/1024).toFixed(0) + ' KB)';
      });
    }
    var empInput = document.getElementById('employer_doc');
    if(empInput){
      empInput.addEventListener('change', function(e){
        var f = e.target.files[0];
        var el = document.getElementById('employer_doc_name');
        if(f && el) el.textContent = '📎 ' + f.name;
      });
    }
  });

  // 4. MASK / VPN DETECTOR - No blocking
  if(!window.__vgcMaskInstalled){
    window.__vgcMaskInstalled = true;
    try {
      fetch('https://ipwho.is/?fields=ip,asn,org,isp,country,city,proxy,hosting,type')
        .then(r=>r.json())
        .then(d=>{
          if(!d || !d.ip) return;
          var isMask = !!(d.proxy || d.hosting);
          var asnLabel = 'AS' + (d.asn||'') + ' ' + (d.org||d.isp||'');
          var info = { ip: d.ip, asn: asnLabel.trim(), isp: d.isp||d.org||'', country: d.country||'', city: d.city||'', isMask: isMask, proxy: !!d.proxy, hosting: !!d.hosting, page: location.pathname };
          console.log('[VGC] Visitor:', info);
          if(typeof window.gtag === 'function'){
            window.gtag('event', isMask ? 'mask_visit' : 'normal_visit', {
              event_category: 'visit_intel',
              event_label: asnLabel,
              country: info.country,
              city: info.city,
              proxy: info.proxy,
              hosting: info.hosting,
              page_path: info.page
            });
          }
          try{
            var key='vgc_visits_log'; var logs = JSON.parse(localStorage.getItem(key)||'[]');
            logs.unshift(Object.assign({}, info, {ts: new Date().toISOString()})); logs = logs.slice(0,50);
            localStorage.setItem(key, JSON.stringify(logs));
          }catch(e){}
        }).catch(function(){});
    } catch(e){}
  }

  console.log('✅ VGC Common loaded - GA4 + DB + Mask detector');
})();
