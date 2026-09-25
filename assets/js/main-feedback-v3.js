(()=>{
  const id="G-0M6MZ2C7D1";
  if(document.querySelector('script[src*="googletagmanager.com/gtag/js?id='+id+'"]')) return;
  if(window.__himanekoGa4Loaded) return;
  window.__himanekoGa4Loaded=true;
  const s=document.createElement("script");
  s.async=true;
  s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(id);
  document.head.appendChild(s);
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
  window.gtag("js",new Date());
  window.gtag("config",id);
})();

document.querySelectorAll('.nav-toggle').forEach(b=>b.addEventListener('click',()=>{const n=b.nextElementSibling,o=n.classList.toggle('open');b.setAttribute('aria-expanded',String(o))}));

(() => {
  "use strict";
  const SUPABASE_URL = "https://ehmmpzukulixwtvvwruq.supabase.co";
  const SUPABASE_KEY = "sb_publishable_woaWa1rGRcnCdClhURO6vQ_2F-_PVF0";
  const REST = SUPABASE_URL + "/rest/v1";
  const workMap = {
    1:{id:"neko",url:"/projects/neko-gotoku.html#himaneko-feedback"},
    2:{id:"device",url:"/projects/device.html#himaneko-feedback"},
    3:{id:"afterwild",url:"/projects/afterwild.html#himaneko-feedback"},
    4:{id:"image-slimmer",url:"/tools/image-slimmer.html#himaneko-feedback"},
    5:{id:"watch-motion",url:"/tools/watch-motion-studio.html#himaneko-feedback"},
    6:{id:"heic-lab",url:"/tools/heic-lab.html#himaneko-feedback"},
    7:{id:"gif-apng",url:"/tools/gif-apng-maker.html#himaneko-feedback"},
    8:{id:"line-sticker",url:"/tools/line-sticker-maker.html#himaneko-feedback"},
    9:{id:"exif-cleaner",url:"/tools/exif-cleaner.html#himaneko-feedback"}
  };

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
  };

  function fmtDate(iso){
    try{
      return new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"numeric",day:"numeric"}).format(new Date(iso));
    }catch(_){ return ""; }
  }

  function voterKey(){
    const key="himaneko_feedback_voter";
    let value=localStorage.getItem(key);
    if(!value){
      value=(crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==="x"?r:(r&3|8);return v.toString(16)}));
      localStorage.setItem(key,value);
    }
    return value;
  }

  async function countRows(table, workId){
    const res=await fetch(REST+"/"+table+"?select=id&work_id=eq."+encodeURIComponent(workId)+"&limit=1",{
      headers:{...headers,Prefer:"count=exact"}
    });
    if(!res.ok) throw new Error(table+" count "+res.status);
    const range=res.headers.get("content-range")||"";
    const total=range.split("/")[1];
    return total && total!=="*" ? Number(total) : (await res.json()).length;
  }

  async function getComments(workId){
    const res=await fetch(REST+"/feedback_comments?select=id,display_name,body,created_at&work_id=eq."+encodeURIComponent(workId)+"&order=created_at.desc&limit=5",{headers});
    if(!res.ok) throw new Error("comments "+res.status);
    return res.json();
  }

  async function addHeart(workId){
    const res=await fetch(REST+"/feedback_hearts",{
      method:"POST",
      headers:{...headers,Prefer:"return=minimal"},
      body:JSON.stringify({work_id:workId,voter_key:voterKey()})
    });
    if(res.ok) return {added:true};
    const data=await res.json().catch(()=>({}));
    if(data.code==="23505") return {added:false,duplicate:true};
    throw new Error(data.message||("heart "+res.status));
  }

  async function addComment(workId,name,body){
    const res=await fetch(REST+"/feedback_comments",{
      method:"POST",
      headers:{...headers,Prefer:"return=minimal"},
      body:JSON.stringify({work_id:workId,display_name:name||"匿名",body})
    });
    if(!res.ok){
      const data=await res.json().catch(()=>({}));
      throw new Error(data.message||("comment "+res.status));
    }
  }

  function setText(root,selector,value){
    root.querySelectorAll(selector).forEach(el=>el.textContent=String(value));
  }

  function renderComments(root,rows){
    const box=root.querySelector(".feedback-comments");
    if(!box) return;
    box.innerHTML="";
    if(!rows.length){
      box.innerHTML='<p class="feedback-empty">まだコメントはありません。最初の「もっとこうしてほしい」を書けます。</p>';
      return;
    }
    rows.forEach(row=>{
      const item=document.createElement("article");
      item.className="feedback-comment";
      const head=document.createElement("div");
      head.className="feedback-comment-head";
      const meta=document.createElement("span");
      meta.textContent=(row.display_name||"匿名")+" ・ "+fmtDate(row.created_at);
      const body=document.createElement("p");
      body.className="feedback-comment-body";
      body.textContent=(row.body||"").trim();
      head.appendChild(meta);
      item.append(head,body);
      box.appendChild(item);
    });
  }

  function ensureForm(root,workId){
    if(!root.classList.contains("feedback-panel") || root.querySelector(".feedback-form")) return;
    root.id="himaneko-feedback";
    const form=document.createElement("form");
    form.className="feedback-form";
    form.innerHTML=`
      <label class="feedback-label">名前 <span>任意</span>
        <input class="feedback-name" maxlength="30" placeholder="匿名でもOK">
      </label>
      <label class="feedback-label">もっとこうしてほしい
        <textarea class="feedback-body" maxlength="500" required placeholder="例：スマホ操作をもっと軽くしてほしい"></textarea>
      </label>
      <div class="feedback-form-foot">
        <span class="feedback-form-status" aria-live="polite"></span>
        <button class="btn pop-purple feedback-submit" type="submit">コメントを送る</button>
      </div>`;
    const comments=root.querySelector(".feedback-comments");
    comments?.before(form);
    form.addEventListener("submit",async e=>{
      e.preventDefault();
      const name=form.querySelector(".feedback-name").value.trim()||"匿名";
      const body=form.querySelector(".feedback-body").value.trim();
      const status=form.querySelector(".feedback-form-status");
      const btn=form.querySelector(".feedback-submit");
      if(!body) return;
      btn.disabled=true; status.textContent="送信中…";
      try{
        await addComment(workId,name,body);
        form.querySelector(".feedback-body").value="";
        status.textContent="送信しました";
        await refresh(root,workId);
      }catch(err){
        console.warn(err); status.textContent="送信できませんでした";
      }finally{btn.disabled=false}
    });
  }

  function wireActions(root,work){
    const controls=[...root.querySelectorAll("[data-feedback-link]")];
    const heart=controls.find(a=>a.querySelector("[data-feedback-hearts]")) || controls[0];
    const comment=controls.find(a=>a.querySelector("[data-feedback-comments]")) || controls[1];

    if(heart && !heart.dataset.bound){
      heart.dataset.bound="1";
      heart.addEventListener("click",async e=>{
        e.preventDefault();
        heart.classList.add("is-busy");
        try{
          const result=await addHeart(work.id);
          heart.classList.toggle("is-liked",true);
          heart.title=result.duplicate?"この端末では追加済みです":"ありがとう";
          await refresh(root,work.id);
        }catch(err){console.warn(err)}
        finally{heart.classList.remove("is-busy")}
      });
    }
    if(comment && !comment.dataset.bound){
      comment.dataset.bound="1";
      comment.addEventListener("click",e=>{
        e.preventDefault();
        if(root.classList.contains("feedback-panel")){
          document.getElementById("himaneko-feedback")?.scrollIntoView({behavior:"smooth",block:"start"});
          root.querySelector(".feedback-body")?.focus({preventScroll:true});
        }else{
          location.href=work.url;
        }
      });
    }
  }

  async function refresh(root,workId){
    try{
      const [hearts,commentsCount,comments]=await Promise.all([
        countRows("feedback_hearts",workId),
        countRows("feedback_comments",workId),
        root.classList.contains("feedback-panel") ? getComments(workId) : Promise.resolve([])
      ]);
      setText(root,"[data-feedback-hearts]",hearts);
      setText(root,"[data-feedback-comments]",commentsCount);
      if(root.classList.contains("feedback-panel")) renderComments(root,comments);
    }catch(err){
      console.warn("feedback load failed",err);
      setText(root,"[data-feedback-hearts]","–");
      setText(root,"[data-feedback-comments]","–");
    }
  }

  async function hydrate(root){
    const work=workMap[Number(root.dataset.feedbackIssue)];
    if(!work) return;
    ensureForm(root,work.id);
    wireActions(root,work);
    await refresh(root,work.id);
  }

  window.initHimanekoFeedback=()=>document.querySelectorAll("[data-feedback-issue]").forEach(hydrate);
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",window.initHimanekoFeedback);
  else window.initHimanekoFeedback();
})();