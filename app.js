// Từ điển công khai chỉ hiển thị mục đã được quản trị viên đánh dấu "approved".
const demoCourses=[
 {level:"CẤP ĐỘ 1 · NHẬP MÔN",title:"Làm quen tiếng Tày",desc:"Chào hỏi, giới thiệu bản thân, gia đình và từ ngữ quen thuộc.",lessons:8},
 {level:"CẤP ĐỘ 2 · GIAO TIẾP",title:"Sinh hoạt hằng ngày",desc:"Trò chuyện, hỏi đường, mua bán, ăn uống và sinh hoạt cộng đồng.",lessons:12},
 {level:"CẤP ĐỘ 3 · VĂN HÓA",title:"Kể chuyện và văn hóa",desc:"Tìm hiểu phong tục, tri thức dân gian, câu chuyện và lối diễn đạt.",lessons:10}
];
const grid=document.querySelector('#courseGrid');
grid.innerHTML=demoCourses.map((c,i)=>`<article class="course"><span class="num">0${i+1}</span><small>${c.level}</small><h3>${c.title}</h3><p>${c.desc}</p><p>${c.lessons} bài dự kiến · Nội dung đang biên soạn</p><a class="button" href="admin.html">Theo dõi nội dung →</a></article>`).join('');
const q=document.querySelector('#q'), results=document.querySelector('#results');
const DICTIONARY_KEY='tayAdminV2';
function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function getApprovedWords(){
 try{const data=JSON.parse(localStorage.getItem(DICTIONARY_KEY)||'{}');return Array.isArray(data.words)?data.words.filter(w=>w.status==='approved'):[]}
 catch{return []}
}
function normalize(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLocaleLowerCase('vi').trim()}
function renderDictionary(){
 const term=q.value.trim();
 if(!term){results.innerHTML='<p class="muted">Nhập từ tiếng Việt hoặc tiếng Tày để tra cứu. Từ điển chỉ công khai nội dung đã được kiểm duyệt.</p>';return}
 const needle=normalize(term);
 const matches=getApprovedWords().filter(w=>[w.tay,w.vi,w.region,w.example].some(v=>normalize(v).includes(needle)));
 if(!matches.length){results.innerHTML='<div class="dictionary-empty"><b>Chưa tìm thấy mục từ phù hợp.</b><p class="muted">Có thể từ này chưa được cộng tác viên đóng góp hoặc chưa được quản trị viên duyệt. Bạn có thể đề xuất từ mới qua trang cộng tác viên.</p><a class="text-link" href="collaborator.html">Đóng góp từ vựng →</a></div>';return}
 results.innerHTML=`<p class="result-count">Tìm thấy ${matches.length} mục từ đã xác minh</p>`+matches.map(w=>`<article class="word-card"><div class="word-main"><span class="word-label">TIẾNG TÀY</span><h3>${escapeHTML(w.tay)}</h3><small>${escapeHTML(w.region||'Định Hóa, Thái Nguyên')}</small></div><div class="word-meaning"><span class="word-label">NGHĨA TIẾNG VIỆT</span><h3>${escapeHTML(w.vi)}</h3>${w.example?`<p><b>Ví dụ / ngữ cảnh:</b> ${escapeHTML(w.example)}</p>`:''}<small>Nguồn xác minh: ${escapeHTML(w.source||'Cộng tác viên')}</small></div></article>`).join('');
}
document.querySelector('#search').addEventListener('click',renderDictionary);
q.addEventListener('keydown',e=>{if(e.key==='Enter')renderDictionary()});
q.addEventListener('input',()=>{if(!q.value.trim())renderDictionary()});
window.addEventListener('storage',e=>{if(e.key===DICTIONARY_KEY&&q.value.trim())renderDictionary()});
renderDictionary();
