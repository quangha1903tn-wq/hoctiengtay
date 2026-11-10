// Bản demo quản trị lưu trên trình duyệt. Không dùng localStorage cho dữ liệu thật nhiều người dùng.
const KEY='tayAdminV2';
const PROFILE_KEY='tayCollaboratorApplicationsV1';
const SUBMISSION_KEY='tayCommunitySubmissionsV1';
const readExtra=key=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return []}};
let contributors=readExtra(PROFILE_KEY), submissions=readExtra(SUBMISSION_KEY);
const initial={lessons:[
 {title:'Chào hỏi và làm quen',level:'Cấp độ 1 – Nhập môn',objective:'Học lời chào, cách đáp lời và giới thiệu tên; cần bản ngữ soạn câu mẫu.'},
 {title:'Gia đình và người thân',level:'Cấp độ 1 – Nhập môn',objective:'Từ xưng hô và quan hệ gia đình theo ngữ cảnh địa phương.'},
 {title:'Ở chợ và mua bán',level:'Cấp độ 2 – Giao tiếp',objective:'Hỏi giá, số đếm, mua bán; cần kiểm tra biến thể.'}
],words:[],audios:[]};
let db;try{db=JSON.parse(localStorage.getItem(KEY))||initial}catch{db=initial}
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 document.querySelector('#lessonCount').textContent=db.lessons.length;
 document.querySelector('#wordCount').textContent=db.words.length;
 document.querySelector('#audioCount').textContent=db.audios.length;
 document.querySelector('#approvedCount').textContent=db.words.filter(w=>w.status==='approved').length;
 contributors=readExtra(PROFILE_KEY); submissions=readExtra(SUBMISSION_KEY);
 document.querySelector('#contributorCount').textContent=contributors.length;
 document.querySelector('#submissionCount').textContent=submissions.length;
 document.querySelector('#lessonList').innerHTML=db.lessons.map((x,i)=>`<div class="item"><div><b>${esc(x.title)}</b><small>${esc(x.level)} · ${esc(x.objective)}</small></div><button class="danger" data-del-lesson="${i}">Xóa</button></div>`).join('')||'<p class="empty">Chưa có bài học.</p>';
 document.querySelector('#wordList').innerHTML=db.words.map((x,i)=>`<div class="item"><div><b>${esc(x.tay)} — ${esc(x.vi)}</b><small>${esc(x.region)} · ${esc(x.source||'Chưa ghi nguồn')}</small></div><span class="tag">${x.status==='approved'?'Đã duyệt':x.status==='review'?'Chờ duyệt':'Bản nháp'}</span><button class="danger" data-del-word="${i}">Xóa</button></div>`).join('')||'<p class="empty">Chưa có từ vựng.</p>';
 document.querySelector('#audioList').innerHTML=db.audios.map((x,i)=>`<div class="item"><div><b>${esc(x.word)}</b><small>${esc(x.speaker)} · ${esc(x.fileName)} · ${esc(x.consent)}</small></div><button class="danger" data-del-audio="${i}">Xóa</button></div>`).join('')||'<p class="empty">Chưa có bản ghi âm.</p>';
 const pending=db.words.map((w,i)=>({...w,i})).filter(w=>w.status!=='approved');
 document.querySelector('#reviewList').innerHTML=pending.map(w=>`<div class="item"><div><b>${esc(w.tay)} — ${esc(w.vi)}</b><small>Địa bàn: ${esc(w.region)} · Xác minh: ${esc(w.source||'Chưa có')}</small></div><button class="button" data-approve="${w.i}">Đánh dấu đã duyệt</button></div>`).join('')||'<p class="empty">Không có mục chờ duyệt.</p>';
 document.querySelector('#contributorList').innerHTML=contributors.map((c,i)=>`<div class="item"><div><b>${esc(c.name)} · ${esc(c.commune||'Chưa ghi xã')}</b><small>${esc(c.contact)} · ${esc(c.fluency||'Chưa nêu mức độ')} · ${esc((c.skills||[]).join(', '))}</small><small>${esc(c.note||'')}</small></div><span class="tag">${c.status==='approved'?'Đã xem':'Chờ xem'}</span><button class="button" data-view-contributor="${i}">Đánh dấu đã xem</button></div>`).join('')||'<p class="empty">Chưa có đăng ký trên trình duyệt này.</p>';
 document.querySelector('#submissionList').innerHTML=submissions.map((c,i)=>`<div class="item"><div><b>${esc(c.tay)}</b><small>${esc(c.vi||'Chưa có nghĩa')} · ${esc(c.commune)} · ${esc(c.context||'')}</small><small>Nguồn: ${esc(c.source||'Không ghi')} · File: ${esc(c.audioName||'Không có')}</small></div><span class="tag">${c.status==='approved'?'Đã duyệt':'Chờ duyệt'}</span><button class="button" data-approve-submission="${i}">Duyệt nội dung</button></div>`).join('')||'<p class="empty">Chưa có đóng góp trên trình duyệt này.</p>';
}
document.addEventListener('click',e=>{
 const t=e.target;
 for(const [attr,key] of [['data-del-lesson','lessons'],['data-del-word','words'],['data-del-audio','audios']]){
  if(t.hasAttribute(attr)){db[key].splice(Number(t.getAttribute(attr)),1);save();render()}
 }
 if(t.hasAttribute('data-approve')){const w=db.words[Number(t.dataset.approve)];w.status='approved';save();render();alert('Đã đánh dấu duyệt trên bản demo. Với hệ thống thật cần lưu người duyệt và thời điểm duyệt.')}
 if(t.hasAttribute('data-view-contributor')){const i=Number(t.dataset.viewContributor);contributors[i].status='approved';localStorage.setItem(PROFILE_KEY,JSON.stringify(contributors));render()}
 if(t.hasAttribute('data-approve-submission')){const i=Number(t.dataset.approveSubmission);submissions[i].status='approved';localStorage.setItem(SUBMISSION_KEY,JSON.stringify(submissions));render();alert('Đã đánh dấu duyệt trên bản demo. Nội dung chưa tự động xuất bản lên từ điển.')}
});
document.querySelector('#lessonForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);db.lessons.push({title:f.get('title'),level:f.get('level'),objective:f.get('objective')});save();e.target.reset();render()});
document.querySelector('#wordForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);db.words.push({tay:f.get('tay'),vi:f.get('vi'),region:f.get('region'),source:f.get('source'),example:f.get('example'),status:f.get('status')});save();e.target.reset();render()});
document.querySelector('#audioForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target),file=f.get('file');db.audios.push({word:f.get('word'),speaker:f.get('speaker'),consent:f.get('consent'),fileName:file.name});save();e.target.reset();render();alert('Đã lưu thông tin file ở bản demo. File âm thanh chưa được tải lên máy chủ.')});
render();
