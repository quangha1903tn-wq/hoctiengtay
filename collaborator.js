// Demo local: dữ liệu chỉ tồn tại trên trình duyệt hiện tại, chưa gửi tới máy chủ.
const PROFILE_KEY='tayCollaboratorApplicationsV1';
const SUBMISSION_KEY='tayCommunitySubmissionsV1';
const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return []}};
const write=(key,data)=>localStorage.setItem(key,JSON.stringify(data));
const show=(id,message)=>{document.getElementById(id).textContent=message};
document.getElementById('profileForm').addEventListener('submit',e=>{
 e.preventDefault();const f=new FormData(e.currentTarget);const skills=f.getAll('skills');
 if(!skills.length){show('profileMessage','Bạn hãy chọn ít nhất một khả năng có thể hỗ trợ.');return}
 const rows=read(PROFILE_KEY);rows.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:f.get('name'),contact:f.get('contact'),commune:f.get('commune'),fluency:f.get('fluency'),skills,note:f.get('note'),status:'pending',createdAt:new Date().toISOString()});write(PROFILE_KEY,rows);e.currentTarget.reset();show('profileMessage','Đã lưu đăng ký trên trình duyệt này. Đây chưa phải xác nhận gửi thành công tới ban quản trị.');
});
document.getElementById('submissionForm').addEventListener('submit',e=>{
 e.preventDefault();const f=new FormData(e.currentTarget);const file=f.get('audio');const rows=read(SUBMISSION_KEY);rows.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),tay:f.get('tay'),vi:f.get('vi'),commune:f.get('commune'),context:f.get('context'),source:f.get('source'),audioName:file&&file.name?file.name:'',status:'pending',createdAt:new Date().toISOString()});write(SUBMISSION_KEY,rows);e.currentTarget.reset();show('submissionMessage','Đã lưu nội dung trên trình duyệt này. File âm thanh chưa được tải lên và nội dung chưa được công khai.');
});
