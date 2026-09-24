document.querySelectorAll('.nav-toggle').forEach(b=>b.addEventListener('click',()=>{const n=b.nextElementSibling,o=n.classList.toggle('open');b.setAttribute('aria-expanded',String(o))}));

(() => {
  "use strict";
  const REPO = "techmew/techmew.github.io";
  const apiBase = "https://api.github.com/repos/" + REPO + "/issues/";
  const webBase = "https://github.com/" + REPO + "/issues/";

  function fmtDate(iso){
    try{
      return new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"numeric",day:"numeric"}).format(new Date(iso));
    }catch(_){ return ""; }
  }

  async function getIssue(issueNo){
    const res = await fetch(apiBase + issueNo, {
      headers: {"Accept":"application/vnd.github+json"}
    });
    if(!res.ok) throw new Error("issue " + res.status);
    return res.json();
  }

  async function getLatestComments(issueNo, count){
    if(!count) return [];
    const per = 5;
    const page = Math.max(1, Math.ceil(count / per));
    const res = await fetch(apiBase + issueNo + "/comments?per_page=" + per + "&page=" + page, {
      headers: {"Accept":"application/vnd.github+json"}
    });
    if(!res.ok) throw new Error("comments " + res.status);
    const rows = await res.json();
    return rows.slice(-5).reverse();
  }

  function issueUrl(no){ return webBase + no; }

  function setText(root, selector, value){
    root.querySelectorAll(selector).forEach(el => el.textContent = String(value));
  }

  function wireLinks(root, no){
    root.querySelectorAll("[data-feedback-link]").forEach(a=>{
      a.href = issueUrl(no);
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  function renderComments(root, comments){
    const box = root.querySelector(".feedback-comments");
    if(!box) return;
    box.innerHTML = "";
    if(!comments.length){
      const p=document.createElement("p");
      p.className="feedback-empty";
      p.textContent="まだコメントはありません。最初の「もっとこうしてほしい」を書けます。";
      box.appendChild(p);
      return;
    }
    comments.forEach(row=>{
      const item=document.createElement("article");
      item.className="feedback-comment";

      const head=document.createElement("div");
      head.className="feedback-comment-head";

      if(row.user && row.user.avatar_url){
        const img=document.createElement("img");
        img.src=row.user.avatar_url;
        img.alt="";
        img.loading="lazy";
        head.appendChild(img);
      }

      const meta=document.createElement("span");
      const name=row.user && row.user.login ? row.user.login : "GitHub user";
      meta.textContent=name + " ・ " + fmtDate(row.created_at);
      head.appendChild(meta);

      const body=document.createElement("p");
      body.className="feedback-comment-body";
      const raw=(row.body || "").trim();
      body.textContent = raw.length > 500 ? raw.slice(0,500) + "…" : raw;

      item.append(head,body);
      box.appendChild(item);
    });
  }

  async function hydrate(root){
    const no = Number(root.dataset.feedbackIssue);
    if(!no) return;
    wireLinks(root,no);
    try{
      const issue=await getIssue(no);
      const hearts=issue.reactions && typeof issue.reactions.heart==="number" ? issue.reactions.heart : 0;
      const comments=Number(issue.comments || 0);
      setText(root,"[data-feedback-hearts]",hearts);
      setText(root,"[data-feedback-comments]",comments);

      if(root.classList.contains("feedback-panel")){
        const latest=await getLatestComments(no,comments);
        renderComments(root,latest);
      }
    }catch(err){
      console.warn("feedback load failed",err);
      setText(root,"[data-feedback-hearts]","–");
      setText(root,"[data-feedback-comments]","–");
      const box=root.querySelector(".feedback-comments");
      if(box){
        box.innerHTML='<p class="feedback-empty">反応を読み込めませんでした。GitHub側では確認できます。</p>';
      }
    }
  }

  window.initHimanekoFeedback = function(){
    document.querySelectorAll("[data-feedback-issue]").forEach(hydrate);
  };
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded", window.initHimanekoFeedback);
  }else{
    window.initHimanekoFeedback();
  }
})();
