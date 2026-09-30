const user=currentUser();
if(!user){
    location.href='login.html'}
    else{
        seedUserFiles(user);initApp()
    }
function esc(s){
    return String(s).replace(/[&<>"']/g,m=>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])
    )}
function dbFiles(){
    return getDB().files.filter(f=>f.userId===user.id)
}
function formatSize(n){
    if(n<1024)return n+' B';
    if(n<1048576)return (n/1024).toFixed(1)+' KB';
    if(n<1073741824)return (n/1048576).toFixed(1)+' MB';
    return(n/1073741824).toFixed(1)+' GB'
}
function formatDate(t){
    return new Date(t)
    .toLocaleDateString(undefined,
        {month:'short',day:'numeric',year:'numeric'}
    )}
function iconFor(type){
    let c=['PDF','DOCX','DOC']
    .includes(type)?'doc':(['PNG','JPG','JPEG','GIF']
        .includes(type)?'img':'pdf');
        return `<span class="file-icon ${c}">${esc(type)}
        </span>`
    }
function visibleFiles(){
    return dbFiles()
    .filter(f=>!f.trashed)
}
function fileRows(files,shared=false){
    if(!files.length)
        return `<div class="empty">No files found.</div>`;
    return `<table class="file-table"><thead><tr><th>Name</th><th>Category</th><th>Size</th><th>Date</th><th></th></tr></thead><tbody>
    ${files.map(f=>`<tr><td><div class="file-name">${iconFor(f.type)}
    <b>${esc(f.name)}</b></div></td><td>
    ${esc(f.category)}</td><td>${formatSize(f.size)}</td><td> ${formatDate(f.created)}</td><td><div class="actions">${shared?'':
        `<button class="tiny-btn" onclick="downloadFile('${f.id}')">Download</button>
        <button class="tiny-btn" onclick="trashFile('${f.id}')">Trash</button>`}
        </div></td></tr>`).join('')}</tbody></table>`
}
function renderDashboard(){
    const files=visibleFiles(),
    trash=dbFiles().filter(f=>f.trashed),
    folders=getDB().folders.filter(f=>f.parentId==='root');
    content.innerHTML=
    `<div class="page-head"><div><h3>Good to see you, 
    ${esc(user.name.split(' ')[0])}
    .</h3><p>Here’s what is happening with your files today.</p></div>
    <button class="btn primary" onclick="openUpload()">＋ Upload files</button>
    </div><div class="cards"><div class="stat">
    <div class="stat-icon">▤</div><small>Total files</small><strong>
    ${files.length}</strong></div>
    <div class="stat"><div class="stat-icon">▣</div><small>Folders</small><strong>
    ${folders.length}</strong></div>
    <div class="stat">
    <div class="stat-icon">⇄</div><small>Shared files</small><strong>
    ${getDB().shares.filter(s=>s.to===user.email).length}
    </strong></div>
    <div class="stat"><div class="stat-icon">⌫</div>
    <small>Trash</small><strong>
    ${trash.length}</strong></div></div>
    <div class="section"><div class="section-head">
    <h4>Recent files</h4><button class="btn small ghost" onclick="navigate('files')">View all</button>
    </div>
    ${fileRows(files.slice().sort((a,b)=>b.created-a.created).slice(0,5))}</div>`
}
function renderFiles(){
    content.innerHTML=`<div class="page-head">
    <div><h3>My Files</h3><p>Search and manage all your documents.</p></div>
    <button class="btn primary" onclick="openUpload()">＋ Upload files</button></div>
    <div class="searchbar"><input id="fileSearch" placeholder="⌕  Search files by name...">
    <select id="catFilter" class="select"><option value="">All categories</option>
    <option>Documents</option><option>Images</option><option>Spreadsheets</option><option>Other</option></select></div>
    <div class="section" id="fileResults">${fileRows(visibleFiles().sort((a,b)=>b.created-a.created))}</div>`;
    fileSearch.oninput=filterFiles;
    catFilter.onchange=filterFiles
}
function filterFiles(){
    const q=fileSearch.value.toLowerCase(),c=catFilter.value;
    document.getElementById('fileResults').innerHTML=fileRows(visibleFiles()
    .filter(f=>f.name.toLowerCase().includes(q)&&(!c||f.category===c))
    .sort((a,b)=>b.created-a.created))
}
function renderFolders(){
    const folders=getDB()
    .folders.filter(f=>f.parentId==='root');
    content.innerHTML=`<div class="page-head">
    <div><h3>Folders</h3><p>Organize your documents into simple folders.</p></div>
    <button class="btn primary" onclick="newFolder()">＋ New folder</button></div>
    <div class="folder-grid">
    ${
        folders.map(f=>`<div class="folder"><div class="folder-icon">▣</div><b>
        ${esc(f.name)}
        </b><small>
        ${visibleFiles().filter(x=>x.folderId===f.id).length} 
        files</small><button class="tiny-btn" style="float:right" onclick="deleteFolder('${f.id}')">Delete</button></div>`)
        .join('')||'<div class="empty">No folders yet.</div>'
    }
    </div>`
}
function renderTrash(){
    const files=dbFiles().filter(f=>f.trashed);
    content.innerHTML=`<div class="page-head"><div><h3>Trash</h3>
    <p>Restore files or permanently remove them.</p></div>
    ${
        files.length?'<button class="btn danger" onclick="emptyTrash()">Empty trash</button>':''
    } 
    </div><div class="section">
    ${
        files.length?`<table class="file-table"><tbody>${files.map(f=>`<tr><td><div class="file-name">
            ${
                iconFor(f.type)
            }
            <b>
            ${
                esc(f.name)
            }
            </b></div></td><td>
            ${formatSize(f.size)}
            </td>
            <td><button class="tiny-btn" onclick="restoreFile('
            ${
                f.id
            }')">Restore</button> 
            <button class="tiny-btn" onclick="deleteForever('
            ${f.id}')">Delete</button></td></tr>`)
            .join('')
        }
        </tbody></table>`:'<div class="empty">Trash is empty.</div>'
    }
    </div>`
}
function renderShared(){
    const db=getDB(),incoming=db.shares.filter(s=>s.to===user.email);
    const files=incoming.map(s=>db.files.find(f=>f.id===s.fileId)).filter(Boolean);
    content.innerHTML=`<div class="page-head">
    <div><h3>Shared with me</h3><p>Files other registered users have shared with you.</p></div></div>
    <div class="section">
    ${fileRows(files,true)}
    </div>`
}
function renderProfile(){
    content.innerHTML=`<div class="page-head">
    <div><h3>Profile</h3><p>Manage your account information.</p></div></div>
    <div class="profile-grid"><div class="profile-card"><div class="profile-avatar">
    ${esc(user.name[0].toUpperCase())}
    </div><h3>
    ${esc(user.name)}</h3><p class="muted">${esc(user.email)}</p></div><div class="profile-card">
    <h3>Edit profile</h3><label>Full name<input id="profileName" value="
    ${esc(user.name)}"></label><button class="btn primary" onclick="saveProfile()">Save changes</button><p 
    id="profileMsg" class="form-msg"></p></div></div>`
}
function navigate(page){
    location.hash=page
}
function render(){
    const page=location.hash.slice(1)||'dashboard',titles={
        dashboard:['OVERVIEW','Dashboard'],
        files:['FILES','My Files'],
        folders:['ORGANIZE','Folders'],
        shared:['COLLABORATION','Shared'],
        trash:['RECOVERY','Trash'],
        profile:['ACCOUNT','Profile']
    };
    document.querySelectorAll('.side-link').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
    document.getElementById('pageKicker').textContent=titles[page]?.[0]||'WORKSPACE';
    document.getElementById('pageTitle').textContent=titles[page]?.[1]||'Dashboard';
    ({dashboard:renderDashboard,files:renderFiles,folders:renderFolders,shared:renderShared,trash:renderTrash,profile:renderProfile}[page]||renderDashboard)();
    document.getElementById('trashCount').textContent=dbFiles().filter(f=>f.trashed).length||''
}
function initApp(){
    avatar.textContent=user.name[0].toUpperCase();
    window.addEventListener('hashchange',render);
    render();
    logoutBtn.onclick=()=>{clearSession();
    location.href='index.html'};
    mobileMenu.onclick=()=>sidebar.classList.toggle('open');
    quickUpload.onclick=openUpload
    
}
function openUpload(){
    fileInput.click();
    fileInput.onchange=()=>{const db=getDB();
        [...fileInput.files].forEach(file=>db.files
            .push({
                id:uid(),
                userId:user.id,
                name:file.name,
                size:file.size,
                type:(file.name.split('.').pop()||'FILE').toUpperCase(),
                category:category(file.type),
                folderId:'root',
                created:Date.now(),
                trashed:false
            })
        );
        saveDB(db);
        fileInput.value='';
        render();
        alert('Files added to your E-File workspace.')
    }
}
function category(m){
    if(m.startsWith('image/'))
        return'Images';
    if(m.includes('spreadsheet')||m.includes('excel'))
        return'Spreadsheets';
    if(m.includes('pdf')||m
    .includes('word')||m
    .includes('text')||m
    .includes('document'))
    return'Documents';
    return'Other'
}
function trashFile(id){
    const db=getDB(),f=db.files.find(x=>x.id===id);
    if(f)f.trashed=true;
    saveDB(db);
    render()
}
function restoreFile(id){
    const db=getDB(),
    f=db.files.find(x=>x.id===id);
    if(f)f.trashed=false;
    saveDB(db);
    render()
}
function deleteForever(id){
    const db=getDB();
    db.files=db.files.filter(f=>f.id!==id);
    saveDB(db);
    render()
}
function emptyTrash(){
    const db=getDB();
    db.files=db.files.filter(f=>!(f.userId===user.id&&f.trashed));
    saveDB(db);render()
}
function downloadFile(id){
    const f=dbFiles().find(x=>x.id===id);
    if(!f)return;
    const blob=new Blob(
        [`E-File placeholder for: ${f.name}\nSize: 
        ${formatSize(f.size)}\nThis frontend demo stores file metadata in LocalStorage.`],
        {type:'text/plain'}
    );
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=f.name+'.txt';
    a.click();URL.revokeObjectURL(a.href)
}
function newFolder(){
    const name=prompt('Folder name:');
    if(!name)return;
    const db=getDB();
    db.folders.push({id:uid(),name:name.trim(),parentId:'root'});
    saveDB(db);
    render()
}
function deleteFolder(id){
    if(
        !confirm('Delete this folder? Files inside remain in My Files.')
    )
    return;
    const db=getDB();
    db.folders=db.folders.filter(f=>f.id!==id);
    db.files.forEach(f=>{
        if(f.folderId===id)f.folderId='root'
    });
    saveDB(db);
    render()
}
function saveProfile(){
    const name=profileName.value.trim();
    if(
        !name
    )
    return;
    const db=getDB(),u=db.users.find(x=>x.id===user.id);
    u.name=name;
    saveDB(db);
    avatar.textContent=name[0].toUpperCase();
    document.getElementById('profileMsg').textContent='Profile updated.';
    renderProfile()
}
